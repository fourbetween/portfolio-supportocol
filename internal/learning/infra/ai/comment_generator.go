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

func (cg *CommentGenerator) Generate(ctx context.Context, params domain.GenerateCommentParams) ([]*domain.Comment, error) {
	discussion, projectPremise, path, children, err := cg.fetchContext(ctx, params)
	if err != nil {
		return nil, err
	}

	prompt := cg.buildPrompt(discussion, projectPremise, path, children, params.CommentType)

	contents, err := cg.generateWithAI(ctx, prompt)
	if err != nil {
		return nil, err
	}

	return cg.createComments(params, contents)
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

func (cg *CommentGenerator) generateWithAI(ctx context.Context, prompt string) ([]string, error) {
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
		return nil, fmt.Errorf("failed to generate content: %w", err)
	}

	var generated []struct {
		Content string `json:"content"`
	}

	if err := json.Unmarshal([]byte(resp.Text()), &generated); err != nil {
		return nil, fmt.Errorf("failed to unmarshal AI response: %w, response: %s", err, resp.Text())
	}

	contents := make([]string, len(generated))
	for i, g := range generated {
		contents[i] = g.Content
	}
	return contents, nil
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
