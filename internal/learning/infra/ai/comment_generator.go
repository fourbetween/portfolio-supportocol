package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"slices"
	"strings"
	"sync"
	"time"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"google.golang.org/genai"
)

type CommentGenerator struct {
	discussionRepo     domain.DiscussionRepository
	commentRepo        domain.CommentRepository
	projectPremiseProv domain.ProjectPremiseProvider
	urlFetcher         domain.URLContentFetcher
	factory            *domain.CommentFactory
	clockSrv           clock.Service
	client             *genai.Client
}

func NewCommentGenerator(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	projectPremiseProv domain.ProjectPremiseProvider,
	urlFetcher domain.URLContentFetcher,
	factory *domain.CommentFactory,
	clockSrv clock.Service,
	apiKey string,
) (*CommentGenerator, error) {
	apiKey = strings.TrimSpace(apiKey)
	if apiKey == "" {
		return nil, fmt.Errorf("gemini api key is required")
	}

	client, err := genai.NewClient(context.Background(), &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, err
	}

	return &CommentGenerator{
		discussionRepo:     discussionRepo,
		commentRepo:        commentRepo,
		projectPremiseProv: projectPremiseProv,
		urlFetcher:         urlFetcher,
		factory:            factory,
		clockSrv:           clockSrv,
		client:             client,
	}, nil
}

func (cg *CommentGenerator) GenerateChildComments(ctx context.Context, params domain.GenerateChildCommentsParams) (domain.CommentGenerationResult, error) {
	discussion, projectPremise, path, children, err := cg.fetchContext(ctx, params)
	if err != nil {
		return domain.CommentGenerationResult{}, err
	}

	prompt := cg.buildPrompt(discussion, projectPremise, path, children, params.CommentType)

	slog.Info(
		"Generating child comments with AI",
		slog.String("prompt", prompt),
		slog.Int("prompt_length", len(prompt)),
	)

	contents, tokens, err := cg.generateWithAI(ctx, prompt)
	if err != nil {
		return domain.CommentGenerationResult{}, err
	}

	comments, err := cg.createComments(params, contents)
	if err != nil {
		return domain.CommentGenerationResult{}, err
	}
	return domain.CommentGenerationResult{Comments: comments, Tokens: tokens}, nil
}

func (cg *CommentGenerator) fetchContext(
	ctx context.Context,
	params domain.GenerateChildCommentsParams,
) (*domain.Discussion, string, []*domain.Comment, []*domain.Comment, error) {
	discussion, err := cg.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
		ID:          params.DiscussionID,
		WorkspaceID: params.WorkspaceID,
	})
	if err != nil {
		return nil, "", nil, nil, err
	}

	projectPremise, err := cg.projectPremiseProv.GetProjectPremise(ctx, params.WorkspaceID, discussion.ProjectID())
	if err != nil {
		return nil, "", nil, nil, err
	}

	var path []*domain.Comment
	if params.ParentCommentID != "" {
		p, err := cg.commentRepo.GetPathToRoot(ctx, params.ParentCommentID)
		if err != nil {
			return nil, "", nil, nil, err
		}
		slices.Reverse(p)
		path = p
	}

	children, err := cg.commentRepo.ListChildren(ctx, domain.ListCommentChildrenParams{
		DiscussionID:    params.DiscussionID,
		ParentCommentID: params.ParentCommentID,
		CommentType:     params.CommentType,
	})
	if err != nil {
		return nil, "", nil, nil, err
	}

	return discussion, projectPremise, path, children, nil
}

func (cg *CommentGenerator) generateWithAI(ctx context.Context, prompt string) ([]string, int32, error) {
	config := &genai.GenerateContentConfig{
		ThinkingConfig: &genai.ThinkingConfig{
			ThinkingLevel: genai.ThinkingLevelHigh,
		},
		ResponseMIMEType: "application/json",
		ResponseSchema: &genai.Schema{
			Type: genai.TypeArray,
			Items: &genai.Schema{
				Type: genai.TypeObject,
				Properties: map[string]*genai.Schema{
					"content": {
						Type: genai.TypeString,
					},
				},
				Required: []string{"content"},
			},
		},
	}

	resp, err := cg.client.Models.GenerateContent(
		ctx,
		"gemini-3.1-flash-lite",
		genai.Text(prompt),
		config,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to generate content: %w", err)
	}

	var generated []struct {
		Content string `json:"content"`
	}

	if err := json.Unmarshal([]byte(resp.Text()), &generated); err != nil {
		return nil, 0, fmt.Errorf("failed to unmarshal AI response: %w, response: %s", err, resp.Text())
	}

	contents := make([]string, len(generated))
	for i, g := range generated {
		contents[i] = g.Content
	}

	var tokens int32
	if resp.UsageMetadata != nil {
		tokens = resp.UsageMetadata.TotalTokenCount
	}
	return contents, tokens, nil
}

func (cg *CommentGenerator) createComments(params domain.GenerateChildCommentsParams, contents []string) ([]*domain.Comment, error) {
	result := make([]*domain.Comment, 0, len(contents))
	for _, content := range contents {
		c, err := cg.factory.Create(domain.CreateCommentParams{
			DiscussionID:    params.DiscussionID,
			ParentCommentID: params.ParentCommentID,
			Body: domain.CommentBody{
				Type:    params.CommentType,
				Content: content,
			},
			Status:    domain.CommentStatusProposed,
			CreatedBy: params.UserID,
		})
		if err != nil {
			return nil, err
		}
		result = append(result, c)
	}
	return result, nil
}

func (cg *CommentGenerator) buildPrompt(discussion *domain.Discussion, projectPremise string, path []*domain.Comment, children []*domain.Comment, commentType string) string {
	var sb strings.Builder
	cg.writeSystemContext(&sb)
	cg.writePremises(&sb, projectPremise, discussion.Premise())
	cg.writeDiscussionTheme(&sb, discussion)
	cg.writeContext(&sb, path)
	cg.writeChildren(&sb, children)
	cg.writeInstructions(&sb, commentType)
	return sb.String()
}

func (cg *CommentGenerator) writeSystemContext(sb *strings.Builder) {
	sb.WriteString("<system_context>\n")
	sb.WriteString("You are an AI assistant for a structured discussion platform that facilitates systematic thinking and constructive dialogue.\n")
	sb.WriteString("This platform organizes discussions as tree structures where each comment has a specific type (e.g., question, answer, support, objection, proposal) and builds upon its ancestor comments as premises.\n")
	sb.WriteString("Your role is to generate comments that advance the discussion by introducing new perspectives, evidence, or logical extensions while maintaining coherence with the established context.\n")
	sb.WriteString("</system_context>\n\n")
}

func (cg *CommentGenerator) writePremises(sb *strings.Builder, projectPremise, discussionPremise string) {
	if projectPremise != "" {
		fmt.Fprintf(sb, "<project_premise>\n%s\n</project_premise>\n\n", projectPremise)
	}
	if discussionPremise != "" {
		fmt.Fprintf(sb, "<discussion_premise>\n%s\n</discussion_premise>\n\n", discussionPremise)
	}
}

func (cg *CommentGenerator) writeDiscussionTheme(sb *strings.Builder, discussion *domain.Discussion) {
	fmt.Fprintf(sb, "<discussion_theme>\n%s\n</discussion_theme>\n\n", discussion.Theme())
}

func (cg *CommentGenerator) writeContext(sb *strings.Builder, path []*domain.Comment) {
	if len(path) == 0 {
		return
	}
	sb.WriteString("<ancestor_comments>\n")
	for i, c := range path {
		fmt.Fprintf(sb, "<comment index=\"%d\" type=\"%s\">\n%s\n</comment>\n", i+1, c.Type(), c.Content())
	}
	sb.WriteString("</ancestor_comments>\n\n")
}

func (cg *CommentGenerator) writeChildren(sb *strings.Builder, children []*domain.Comment) {
	if len(children) == 0 {
		return
	}
	sb.WriteString("<existing_comments description=\"Do NOT duplicate these\">\n")
	for i, c := range children {
		fmt.Fprintf(sb, "<comment index=\"%d\" type=\"%s\">\n%s\n</comment>\n", i+1, c.Type(), c.Content())
	}
	sb.WriteString("</existing_comments>\n\n")
}

func (cg *CommentGenerator) writeInstructions(sb *strings.Builder, commentType string) {
	sb.WriteString("<instructions>\n")
	fmt.Fprintf(sb, "Generate exactly 3 comments of type \"%s\" that respond to the parent comment (or discussion theme if no parent exists).\n\n", commentType)

	sb.WriteString("Core principles:\n")
	sb.WriteString("- Each comment must be a single atomic idea: one clear point per comment, no compound statements.\n")
	sb.WriteString("- Treat all ancestor comments as established premises. Your comments must logically extend from them, never contradict them.\n")
	sb.WriteString("- Respect the semantic meaning of the comment type. For example:\n")
	sb.WriteString("  * \"support\"/\"賛成\": Provide specific evidence, examples, or reasoning that strengthens the parent.\n")
	sb.WriteString("  * \"objection\"/\"反対\": Identify specific logical gaps, counterexamples, or alternative interpretations.\n")
	sb.WriteString("  * \"question\"/\"疑問\": Ask about unstated assumptions, implications, or clarifications needed.\n")
	sb.WriteString("  * \"proposal\"/\"提案\": Suggest concrete actions, solutions, or next steps that follow from the context.\n\n")

	sb.WriteString("Differentiation requirements:\n")
	sb.WriteString("- Each of the 3 comments must approach the parent from a distinct angle (e.g., different evidence, different stakeholder perspective, different time horizon).\n")
	sb.WriteString("- Do not duplicate, paraphrase, or overlap with existing sibling comments. Instead, fill gaps they leave.\n")
	sb.WriteString("- Prefer specificity over generality: cite concrete examples, data, or scenarios rather than abstract statements.\n\n")

	sb.WriteString("Style and format:\n")
	sb.WriteString("- Match the language, tone, and formality of the existing comments exactly.\n")
	sb.WriteString("- Keep each comment concise (1-3 sentences). Avoid meta-commentary, hedging phrases, or self-referential language.\n")
	sb.WriteString("- Do not include greetings, sign-offs, or references to being an AI.\n")
	sb.WriteString("- Use the same punctuation style and formatting conventions as the context.\n")
	sb.WriteString("</instructions>")
}

type generatedDiscussionComment struct {
	Type        string `json:"type"`
	Content     string `json:"content"`
	ParentIndex int    `json:"parent_index"`
}

type generatedDiscussion struct {
	Theme      string                       `json:"theme"`
	Premise    string                       `json:"premise"`
	Conclusion string                       `json:"conclusion"`
	Comments   []generatedDiscussionComment `json:"comments"`
}

func (cg *CommentGenerator) GenerateDiscussion(ctx context.Context, params domain.GenerateDiscussionParams) (domain.DiscussionGenerationResult, error) {
	if params.Text != "" && len(params.URLs) != 0 {
		return domain.DiscussionGenerationResult{}, fmt.Errorf("text and URLs cannot be provided at the same time")
	}
	if params.Text == "" && len(params.URLs) == 0 {
		return domain.DiscussionGenerationResult{}, fmt.Errorf("either text or URLs must be provided")
	}

	projectPremise, err := cg.projectPremiseProv.GetProjectPremise(ctx, params.WorkspaceID, params.ProjectID)
	if err != nil {
		return domain.DiscussionGenerationResult{}, err
	}

	var fetchedContents []fetchedURLContent
	if len(params.URLs) > 0 {
		results := cg.fetchURLContents(ctx, params.URLs)
		for _, r := range results {
			if r.err != nil {
				slog.Warn("Failed to fetch URL content", slog.String("url", r.url), slog.String("error", r.err.Error()))
				continue
			}
			fetchedContents = append(fetchedContents, fetchedURLContent{url: r.url, content: r.content})
		}
		if len(fetchedContents) == 0 && params.Text == "" {
			return domain.DiscussionGenerationResult{}, fmt.Errorf("failed to fetch any URL content")
		}
	}

	prompt := cg.buildGenerateDiscussionPrompt(projectPremise, params.Title, params.Text, fetchedContents, params.Language)

	slog.Info(
		"Generating discussion with AI",
		slog.String("prompt", prompt),
		slog.Int("prompt_length", len(prompt)),
	)

	generated, tokens, err := cg.generateFullDiscussionWithAI(ctx, prompt, params.ModelLevel)
	if err != nil {
		return domain.DiscussionGenerationResult{}, err
	}

	comments, err := cg.createGeneratedDiscussionComments(params, generated.Comments)
	if err != nil {
		return domain.DiscussionGenerationResult{}, err
	}

	return domain.DiscussionGenerationResult{
		Theme:      generated.Theme,
		Premise:    generated.Premise,
		Conclusion: generated.Conclusion,
		Language:   params.Language,
		Comments:   comments,
		Tokens:     tokens,
	}, nil
}

type fetchedURLContent struct {
	url     string
	content string
}

type fetchResult struct {
	url     string
	content string
	err     error
}

func (cg *CommentGenerator) fetchURLContents(ctx context.Context, urls []string) []fetchResult {
	results := make([]fetchResult, len(urls))
	var wg sync.WaitGroup
	for i, u := range urls {
		wg.Add(1)
		go func(idx int, rawURL string) {
			defer wg.Done()
			content, err := cg.urlFetcher.Fetch(ctx, rawURL)
			results[idx] = fetchResult{url: rawURL, content: content, err: err}
		}(i, u)
	}
	wg.Wait()
	return results
}

func (cg *CommentGenerator) buildGenerateDiscussionPrompt(projectPremise string, title string, text string, fetchedContents []fetchedURLContent, lang domain.DiscussionLanguage) string {
	var sb strings.Builder
	cg.writeSystemContext(&sb)
	if projectPremise != "" {
		fmt.Fprintf(&sb, "<project_premise>\n%s\n</project_premise>\n\n", projectPremise)
	}
	if title != "" {
		fmt.Fprintf(&sb, "<title>\n%s\n</title>\n\n", title)
	}
	if text != "" {
		fmt.Fprintf(&sb, "<source type=\"text\">\n%s\n</source>\n\n", text)
	}
	for _, fc := range fetchedContents {
		fmt.Fprintf(&sb, "<source type=\"url\" url=\"%s\">\n%s\n</source>\n\n", fc.url, fc.content)
	}
	cg.writeGenerateDiscussionInstructions(&sb, title != "", lang)
	return sb.String()
}

func (cg *CommentGenerator) writeGenerateDiscussionInstructions(sb *strings.Builder, hasTitle bool, lang domain.DiscussionLanguage) {
	sb.WriteString("<instructions>\n")
	sb.WriteString("Transform the source material into a structured discussion tree that enables systematic exploration of the topic.\n\n")

	sb.WriteString("Step 1: Extract and analyze\n")
	sb.WriteString("- Identify every distinct claim, fact, data point, example, assumption, and sub-argument in the source.\n")
	sb.WriteString("- Note relationships between ideas: support, contrast, causation, evidence, implications.\n\n")

	sb.WriteString("Step 2: Define discussion structure\n")
	if hasTitle {
		sb.WriteString("- Theme: A concise question or statement (max 255 chars) that captures the core issue, guided by the provided title.\n")
	} else {
		sb.WriteString("- Theme: A concise question or statement (max 255 chars) that captures the core issue to be explored.\n")
	}
	sb.WriteString("- Premise: Summarize foundational assumptions, context, and constraints (max 4000 chars). This sets the stage for all comments.\n")
	sb.WriteString("- Conclusion: Synthesize key findings, open questions, or decision points (max 1000 chars). This reflects what the discussion reveals.\n\n")

	sb.WriteString("Step 3: Build the comment tree\n")
	sb.WriteString("Create a hierarchical structure where:\n")
	sb.WriteString("- Root-level comments introduce major themes, claims, or questions from the source.\n")
	sb.WriteString("- Child comments deepen the analysis by providing evidence, examples, counterpoints, or implications.\n")
	sb.WriteString("- Each branch explores 'why', 'how', 'evidence for', 'evidence against', and 'so what'.\n")
	sb.WriteString("- Extract every piece of information from the source that relates to the discussion theme and represent it somewhere in the comment tree. Do not omit facts, data points, examples, or sub-arguments even if they seem minor.\n\n")

	sb.WriteString("Comment type semantics (use consistently):\n")
	sb.WriteString("- Use descriptive type names that match the source language (e.g., 'claim'/'主張', 'evidence'/'根拠', 'fact'/'事実', 'question'/'疑問', 'supplement'/'補足', 'example'/'例').\n")
	sb.WriteString("- The type must accurately reflect the comment's role in the argument structure.\n\n")

	sb.WriteString("Comment content rules:\n")
	sb.WriteString("- Each comment = one atomic idea. If a point has multiple facets, create sibling or child comments.\n")
	sb.WriteString("- Be exhaustive: represent all substantive content from the source without summarization.\n")
	sb.WriteString("- Never restate the theme or premise in a comment. Comments must add new information.\n")
	sb.WriteString("- Express logical relationships through tree structure and comment type, not through connecting phrases within the text.\n")
	sb.WriteString("- Include specific data, examples, and nuances from the source. Do not generalize away details.\n")
	sb.WriteString("- Generate as many comments as needed to fully capture the source content. More comments are preferable to fewer; there is no upper limit concern.\n\n")

	sb.WriteString("Tree structure rules:\n")
	sb.WriteString("- Use parent_index to establish hierarchy (-1 for root comments, 0-based index for children).\n")
	sb.WriteString("- Create deep branches (3-5 levels) to explore ideas thoroughly.\n")
	sb.WriteString("- Ensure every major claim has supporting evidence as children, and every piece of evidence connects to a claim as parent.\n\n")

	sb.WriteString("Language and style:\n")
	fmt.Fprintf(sb, "- Use %s consistently for theme, premise, conclusion, all comments, and comment types.\n", lang)
	sb.WriteString("- Write in a clear, factual, analytical tone appropriate to the source material.\n")
	sb.WriteString("- Keep each comment concise (1-3 sentences) while preserving essential detail.\n")
	sb.WriteString("</instructions>")
}

func (cg *CommentGenerator) generateFullDiscussionWithAI(ctx context.Context, prompt string, modelLevel domain.ModelLevel) (generatedDiscussion, int32, error) {
	modelName := cg.selectModel(modelLevel)
	config := &genai.GenerateContentConfig{
		ThinkingConfig: &genai.ThinkingConfig{
			ThinkingLevel: genai.ThinkingLevelHigh,
		},
		ResponseMIMEType: "application/json",
		ResponseSchema: &genai.Schema{
			Type: genai.TypeObject,
			Properties: map[string]*genai.Schema{
				"theme": {
					Type: genai.TypeString,
				},
				"premise": {
					Type: genai.TypeString,
				},
				"conclusion": {
					Type: genai.TypeString,
				},
				"comments": {
					Type: genai.TypeArray,
					Items: &genai.Schema{
						Type: genai.TypeObject,
						Properties: map[string]*genai.Schema{
							"type": {
								Type: genai.TypeString,
							},
							"content": {
								Type: genai.TypeString,
							},
							"parent_index": {
								Type: genai.TypeInteger,
							},
						},
						Required: []string{"type", "content", "parent_index"},
					},
				},
			},
			Required: []string{"theme", "premise", "conclusion", "comments"},
		},
	}

	resp, err := cg.client.Models.GenerateContent(
		ctx,
		modelName,
		genai.Text(prompt),
		config,
	)
	if err != nil {
		return generatedDiscussion{}, 0, fmt.Errorf("failed to generate discussion: %w", err)
	}

	var generated generatedDiscussion
	if err := json.Unmarshal([]byte(resp.Text()), &generated); err != nil {
		return generatedDiscussion{}, 0, fmt.Errorf("failed to unmarshal AI response: %w, response: %s", err, resp.Text())
	}

	var tokens int32
	if resp.UsageMetadata != nil {
		tokens = resp.UsageMetadata.TotalTokenCount
	}
	return generated, tokens, nil
}

func (cg *CommentGenerator) selectModel(level domain.ModelLevel) string {
	switch level {
	case domain.ModelLevelHigh:
		return "gemini-3.5-flash"
	case domain.ModelLevelMedium:
		return "gemini-3-flash-preview"
	default:
		return "gemini-3.1-flash-lite"
	}
}

func (cg *CommentGenerator) createGeneratedDiscussionComments(params domain.GenerateDiscussionParams, generated []generatedDiscussionComment) ([]*domain.Comment, error) {
	result := make([]*domain.Comment, 0, len(generated))
	idByIndex := make(map[int]string, len(generated))

	depths := make([]int, len(generated))
	maxDepth := 0
	for i, g := range generated {
		if g.ParentIndex < 0 {
			depths[i] = 0
		} else {
			depths[i] = depths[g.ParentIndex] + 1
		}
		if depths[i] > maxDepth {
			maxDepth = depths[i]
		}
	}

	now := cg.clockSrv.Now()

	for i, g := range generated {
		parentCommentID := ""
		if g.ParentIndex >= 0 {
			parentID, ok := idByIndex[g.ParentIndex]
			if !ok {
				return nil, fmt.Errorf("parent_index %d not found for comment at index %d", g.ParentIndex, i)
			}
			parentCommentID = parentID
		}

		createdAt := now.Add(-time.Duration(maxDepth-depths[i]) * time.Second)

		c, err := cg.factory.Create(domain.CreateCommentParams{
			DiscussionID:    "",
			ParentCommentID: parentCommentID,
			Body: domain.CommentBody{
				Type:    g.Type,
				Content: g.Content,
			},
			Status:    domain.CommentStatusActive,
			CreatedBy: params.UserID,
			CreatedAt: createdAt,
		})
		if err != nil {
			return nil, err
		}

		result = append(result, c)
		idByIndex[i] = c.ID()
	}

	return result, nil
}
