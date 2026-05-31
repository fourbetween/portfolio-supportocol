package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"slices"
	"strings"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"google.golang.org/genai"
)

type CommentGenerator struct {
	discussionRepo     domain.DiscussionRepository
	commentRepo        domain.CommentRepository
	projectPremiseProv domain.ProjectPremiseProvider
	factory            *domain.CommentFactory
	client             *genai.Client
}

func NewCommentGenerator(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	projectPremiseProv domain.ProjectPremiseProvider,
	factory *domain.CommentFactory,
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
		factory:            factory,
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
	cg.writePremises(&sb, projectPremise, discussion.Premise())
	cg.writeDiscussionTheme(&sb, discussion)
	cg.writeContext(&sb, path)
	cg.writeChildren(&sb, children)
	cg.writeInstructions(&sb, commentType)
	return sb.String()
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
	fmt.Fprintf(sb, "Based on the context above, act as a participant and generate 3 appropriate comments. The role/type of your comments must be: \"%s\".\n", commentType)
	sb.WriteString("Each comment should be concise.\n")
	sb.WriteString("Ensure the generated comments provide new perspectives and do not overlap with the existing comments.\n")
	sb.WriteString("The generated comments must be logically consistent with the context (ancestors) and must not contradict any information or positions established in the preceding comments.\n")
	sb.WriteString("The style of the generated comments (e.g., use of punctuation, politeness level, tone) should match the existing comments in the context.\n")
	sb.WriteString("The language of the generated content must match the language used in the discussion theme and previous comments.\n")
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
	Language   string                       `json:"language"`
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

	prompt := cg.buildGenerateDiscussionPrompt(projectPremise, params.Title, params.Text, params.URLs)

	var tools []*genai.Tool
	if len(params.URLs) > 0 {
		tools = []*genai.Tool{{URLContext: &genai.URLContext{}}}
	}

	slog.Info(
		"Generating discussion with AI",
		slog.String("prompt", prompt),
		slog.Int("prompt_length", len(prompt)),
		slog.Int("num_tools", len(tools)),
	)

	generated, tokens, err := cg.generateFullDiscussionWithAI(ctx, prompt, tools)
	if err != nil {
		return domain.DiscussionGenerationResult{}, err
	}

	lang := domain.DiscussionLanguage(generated.Language)
	if err := lang.Validate(); err != nil {
		lang = domain.DiscussionLanguageJa
	}

	comments, err := cg.createGeneratedDiscussionComments(params, generated.Comments)
	if err != nil {
		return domain.DiscussionGenerationResult{}, err
	}

	return domain.DiscussionGenerationResult{
		Theme:      generated.Theme,
		Premise:    generated.Premise,
		Conclusion: generated.Conclusion,
		Language:   lang,
		Comments:   comments,
		Tokens:     tokens,
	}, nil
}

func (cg *CommentGenerator) buildGenerateDiscussionPrompt(projectPremise string, title string, text string, urls []string) string {
	var sb strings.Builder
	if projectPremise != "" {
		fmt.Fprintf(&sb, "<project_premise>\n%s\n</project_premise>\n\n", projectPremise)
	}
	if title != "" {
		fmt.Fprintf(&sb, "<title>\n%s\n</title>\n\n", title)
	}
	if text != "" {
		fmt.Fprintf(&sb, "<source type=\"text\">\n%s\n</source>\n\n", text)
	}
	for _, u := range urls {
		fmt.Fprintf(&sb, "<source type=\"url\">\n%s\n</source>\n\n", u)
	}
	cg.writeGenerateDiscussionInstructions(&sb, title != "")
	return sb.String()
}

func (cg *CommentGenerator) writeGenerateDiscussionInstructions(sb *strings.Builder, hasTitle bool) {
	sb.WriteString("<instructions>\n")
	sb.WriteString("Follow these steps to generate a complete discussion:\n")
	sb.WriteString("1. Analyze the source document and extract every single fact, data point, specific example, and sub-argument.\n")
	if hasTitle {
		sb.WriteString("2. Generate the discussion theme, premise, and conclusion from the perspective of the provided title. The title should guide how the source material is interpreted and structured into a discussion.\n")
	} else {
		sb.WriteString("2. Generate the discussion theme, premise, and conclusion based on the source material.\n")
	}
	sb.WriteString("3. Organize the extracted points into a logical hierarchy (a discussion tree) where each branch dives deep into 'why', 'how', and 'evidence'.\n")
	sb.WriteString("4. Convert each atomic point into a structured comment following the rules below.\n")

	sb.WriteString("\nRules for discussion generation:\n")
	sb.WriteString("- The theme must be a concise title for the discussion (max 255 characters).\n")
	sb.WriteString("- The premise must summarize the foundational assumptions or context of the discussion (max 4000 characters).\n")
	sb.WriteString("- The conclusion must synthesize the key findings or outcomes of the discussion (max 1000 characters).\n")
	sb.WriteString("- Detect the language of the source material and use it consistently for the theme, premise, conclusion, comments, and comment types.\n")

	sb.WriteString("\nRules for comment generation:\n")
	sb.WriteString("- Generate as many comments as necessary to fully represent the entire content of the source document. Do not summarize; be exhaustive.\n")
	sb.WriteString("- Each comment must be a single, concise sentence focusing on one 'atomic' idea. If a point is complex, break it into multiple child comments.\n")
	sb.WriteString("- Do NOT generate comments that merely restate or paraphrase the discussion theme itself. Comments must add new information or analysis beyond the theme.\n")
	sb.WriteString("- Use 'parent_index' to indicate the 0-based index of the parent comment (-1 for root-level comments).\n")
	sb.WriteString("- Create deep branches: for every main point, include child comments for supporting evidence, numerical data, and specific nuances from the text.\n")
	sb.WriteString("- Express logical relationships (e.g., support, contrast, evidence) through the comment type, never through sentence connectors.\n")
	sb.WriteString("- The language of the comments and the comment types must strictly match the detected language.\n")
	sb.WriteString("</instructions>")
}

func (cg *CommentGenerator) generateFullDiscussionWithAI(ctx context.Context, prompt string, tools []*genai.Tool) (generatedDiscussion, int32, error) {
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
				"language": {
					Type: genai.TypeString,
					Enum: []string{"en", "ja"},
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
			Required: []string{"theme", "premise", "conclusion", "language", "comments"},
		},
		Tools: tools,
	}

	resp, err := cg.client.Models.GenerateContent(
		ctx,
		"gemini-3-flash-preview",
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

func (cg *CommentGenerator) createGeneratedDiscussionComments(params domain.GenerateDiscussionParams, generated []generatedDiscussionComment) ([]*domain.Comment, error) {
	result := make([]*domain.Comment, 0, len(generated))
	idByIndex := make(map[int]string, len(generated))

	for i, g := range generated {
		parentCommentID := ""
		if g.ParentIndex >= 0 {
			parentID, ok := idByIndex[g.ParentIndex]
			if !ok {
				return nil, fmt.Errorf("parent_index %d not found for comment at index %d", g.ParentIndex, i)
			}
			parentCommentID = parentID
		}

		c, err := cg.factory.Create(domain.CreateCommentParams{
			DiscussionID:    "",
			ParentCommentID: parentCommentID,
			Body: domain.CommentBody{
				Type:    g.Type,
				Content: g.Content,
			},
			Status:    domain.CommentStatusActive,
			CreatedBy: params.UserID,
		})
		if err != nil {
			return nil, err
		}

		result = append(result, c)
		idByIndex[i] = c.ID()
	}

	return result, nil
}
