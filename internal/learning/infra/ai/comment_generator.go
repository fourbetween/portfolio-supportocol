package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"slices"
	"strings"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"google.golang.org/genai"
)

const defaultModel = "gemini-3.1-flash-lite-preview"

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

func (cg *CommentGenerator) GenerateComments(ctx context.Context, params domain.GenerateCommentParams) (domain.CommentGenerationResult, error) {
	discussion, projectPremise, path, children, err := cg.fetchContext(ctx, params)
	if err != nil {
		return domain.CommentGenerationResult{}, err
	}

	prompt := cg.buildPrompt(discussion, projectPremise, path, children, params.CommentType)

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
	params domain.GenerateCommentParams,
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
			ThinkingLevel: genai.ThinkingLevelMedium,
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
		defaultModel,
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

func (cg *CommentGenerator) createComments(params domain.GenerateCommentParams, contents []string) ([]*domain.Comment, error) {
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

func (cg *CommentGenerator) GenerateDiscussionComments(ctx context.Context, params domain.GenerateDiscussionCommentsParams) (domain.CommentGenerationResult, error) {
	discussion, err := cg.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
		ID:          params.DiscussionID,
		WorkspaceID: params.WorkspaceID,
	})
	if err != nil {
		return domain.CommentGenerationResult{}, err
	}

	projectPremise, err := cg.projectPremiseProv.GetProjectPremise(ctx, params.WorkspaceID, discussion.ProjectID())
	if err != nil {
		return domain.CommentGenerationResult{}, err
	}

	prompt := cg.buildDiscussionPrompt(discussion, projectPremise, params.SourceType, params.SourceBody)

	generated, tokens, err := cg.generateDiscussionWithAI(ctx, prompt)
	if err != nil {
		return domain.CommentGenerationResult{}, err
	}

	comments, err := cg.createDiscussionComments(params, generated)
	if err != nil {
		return domain.CommentGenerationResult{}, err
	}
	return domain.CommentGenerationResult{Comments: comments, Tokens: tokens}, nil
}

func (cg *CommentGenerator) buildDiscussionPrompt(discussion *domain.Discussion, projectPremise, sourceType, sourceBody string) string {
	var sb strings.Builder
	cg.writePremises(&sb, projectPremise, discussion.Premise())
	cg.writeDiscussionTheme(&sb, discussion)
	fmt.Fprintf(&sb, "<source type=\"%s\">\n%s\n</source>\n\n", sourceType, sourceBody)
	cg.writeDiscussionInstructions(&sb)
	return sb.String()
}

func (cg *CommentGenerator) writeDiscussionInstructions(sb *strings.Builder) {
	sb.WriteString("<instructions>\n")
	// ステップ・バイ・ステップの思考プロセスを導入
	sb.WriteString("Follow these steps to ensure the highest level of detail and logical depth:\n")
	sb.WriteString("1. Analyze the source document and extract every single fact, data point, specific example, and sub-argument.\n")
	sb.WriteString("2. Organize these points into a logical hierarchy (a discussion tree) where each branch dives deep into 'why', 'how', and 'evidence'.\n")
	sb.WriteString("3. Convert each atomic point into a structured comment following the rules below.\n")

	sb.WriteString("\nRules for generation:\n")
	// 詳細さと網羅性の指示
	sb.WriteString("- Generate as many comments as necessary to fully represent the entire content of the source document. Do not summarize; be exhaustive.\n")
	sb.WriteString("- Each comment must be a single, concise sentence focusing on one 'atomic' idea. If a point is complex, break it into multiple child comments.\n")

	// 構造とフォーマットの指示
	sb.WriteString("- Use 'parent_index' to indicate the 0-based index of the parent comment (-1 for root-level comments).\n")
	sb.WriteString("- Create deep branches: for every main point, include child comments for supporting evidence, numerical data, and specific nuances from the text.\n")
	sb.WriteString("- Express logical relationships (e.g., support, contrast, evidence) through the comment type, never through sentence connectors.\n")

	// 言語設定
	sb.WriteString("- The language of the comments and the comment types must strictly match the language of the discussion theme.\n")
	sb.WriteString("</instructions>")
}

func (cg *CommentGenerator) generateDiscussionWithAI(ctx context.Context, prompt string) ([]generatedDiscussionComment, int32, error) {
	config := &genai.GenerateContentConfig{
		ThinkingConfig: &genai.ThinkingConfig{
			ThinkingLevel: genai.ThinkingLevelMedium,
		},
		ResponseMIMEType: "application/json",
		ResponseSchema: &genai.Schema{
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
	}

	resp, err := cg.client.Models.GenerateContent(
		ctx,
		defaultModel,
		genai.Text(prompt),
		config,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to generate discussion content: %w", err)
	}

	var generated []generatedDiscussionComment
	if err := json.Unmarshal([]byte(resp.Text()), &generated); err != nil {
		return nil, 0, fmt.Errorf("failed to unmarshal AI response: %w, response: %s", err, resp.Text())
	}

	var tokens int32
	if resp.UsageMetadata != nil {
		tokens = resp.UsageMetadata.TotalTokenCount
	}
	return generated, tokens, nil
}

func (cg *CommentGenerator) createDiscussionComments(params domain.GenerateDiscussionCommentsParams, generated []generatedDiscussionComment) ([]*domain.Comment, error) {
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
			DiscussionID:    params.DiscussionID,
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
