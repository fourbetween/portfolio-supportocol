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

const defaultModel = "gemini-3-flash-preview"

type CommentGenerator struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	factory        *domain.CommentFactory
	client         *genai.Client
}

func NewCommentGenerator(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	factory *domain.CommentFactory,
	apiKey string,
) (*CommentGenerator, error) {
	client, err := genai.NewClient(context.TODO(), &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, err
	}

	return &CommentGenerator{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		factory:        factory,
		client:         client,
	}, nil
}

func (cg *CommentGenerator) Generate(ctx context.Context, params domain.GenerateCommentParams) ([]*domain.Comment, error) {
	discussion, path, siblings, err := cg.fetchContext(ctx, params)
	if err != nil {
		return nil, err
	}

	prompt := cg.buildPrompt(discussion, path, siblings, params.CommentType)

	contents, err := cg.generateWithAI(ctx, prompt)
	if err != nil {
		return nil, err
	}

	return cg.createComments(params, contents)
}

func (cg *CommentGenerator) fetchContext(
	ctx context.Context,
	params domain.GenerateCommentParams,
) (*domain.Discussion, []*domain.Comment, []*domain.Comment, error) {
	discussion, err := cg.discussionRepo.Load(ctx, domain.LoadParams{
		ID:        params.DiscussionID,
		CreatedBy: params.UserID,
	})
	if err != nil {
		return nil, nil, nil, err
	}

	var path []*domain.Comment
	var siblings []*domain.Comment
	if params.ParentCommentID != nil {
		p, err := cg.commentRepo.PathToRoot(ctx, *params.ParentCommentID)
		if err != nil {
			return nil, nil, nil, err
		}
		slices.Reverse(p)
		path = p

		siblings, err = cg.commentRepo.Siblings(ctx, *params.ParentCommentID)
		if err != nil {
			return nil, nil, nil, err
		}
	}

	return discussion, path, siblings, nil
}

func (cg *CommentGenerator) generateWithAI(ctx context.Context, prompt string) ([]string, error) {
	config := &genai.GenerateContentConfig{
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
		return nil, err
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
			CommentTypeID:   params.CommentType,
			Content:         content,
			Status:          domain.CommentStatusProposed,
			PostedBy:        params.UserID,
		})
		if err != nil {
			return nil, err
		}
		result = append(result, c)
	}
	return result, nil
}

func (cg *CommentGenerator) buildPrompt(discussion *domain.Discussion, path []*domain.Comment, siblings []*domain.Comment, commentType string) string {
	var sb strings.Builder
	cg.writeDiscussionTheme(&sb, discussion)
	cg.writeContext(&sb, path)
	cg.writeSiblings(&sb, siblings)
	cg.writeInstructions(&sb, commentType)
	return sb.String()
}

func (cg *CommentGenerator) writeDiscussionTheme(sb *strings.Builder, discussion *domain.Discussion) {
	fmt.Fprintf(sb, "Discussion Theme: %s\n", discussion.Theme())
}

func (cg *CommentGenerator) writeContext(sb *strings.Builder, path []*domain.Comment) {
	if len(path) == 0 {
		return
	}
	sb.WriteString("Context (Ancestors):\n")
	for i, c := range path {
		fmt.Fprintf(sb, "%d. %s: %s\n", i+1, c.CommentType(), c.Content())
	}
}

func (cg *CommentGenerator) writeSiblings(sb *strings.Builder, siblings []*domain.Comment) {
	if len(siblings) == 0 {
		return
	}
	sb.WriteString("Existing Sibling Comments (Do NOT duplicate these):\n")
	for _, s := range siblings {
		fmt.Fprintf(sb, "- %s\n", s.Content())
	}
}

func (cg *CommentGenerator) writeInstructions(sb *strings.Builder, commentType string) {
	fmt.Fprintf(sb, "\n\nBased on the context above, generate 3 appropriate comments as \"%s\".\n", commentType)
	sb.WriteString("Each comment should be concise.\n")
	sb.WriteString("Ensure the generated comments provide new perspectives and do not overlap with the existing sibling comments.\n")
	sb.WriteString("The style of the generated comments (e.g., use of punctuation, politeness level, tone) should match the existing comments in the context.\n")
	sb.WriteString("The language of the generated content must match the language used in the discussion theme and previous comments.")
}
