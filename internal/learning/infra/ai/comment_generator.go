package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"google.golang.org/genai"
)

type CommentGenerator struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	factory        *domain.Factory
	client         *genai.Client
}

func NewCommentGenerator(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	factory *domain.Factory,
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
	discussion, err := cg.discussionRepo.Load(ctx, domain.LoadParams{ID: params.DiscussionID})
	if err != nil {
		return nil, err
	}

	var ancestors []*domain.Comment
	if params.ParentCommentID != nil {
		comments, err := cg.commentRepo.List(ctx, params.DiscussionID)
		if err != nil {
			return nil, err
		}

		commentMap := make(map[string]*domain.Comment)
		for _, c := range comments {
			commentMap[c.ID()] = c
		}

		currID := *params.ParentCommentID
		for {
			c, ok := commentMap[currID]
			if !ok {
				break
			}
			ancestors = append([]*domain.Comment{c}, ancestors...)
			if c.ParentCommentID() == nil {
				break
			}
			currID = *c.ParentCommentID()
		}
	}

	prompt := cg.buildPrompt(discussion, ancestors, params.CommentType)

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
		"gemini-3-flash-preview",
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

	var result []*domain.Comment
	for _, g := range generated {
		c, err := cg.factory.NewComment(domain.NewCommentParams{
			DiscussionID:    params.DiscussionID,
			ParentCommentID: params.ParentCommentID,
			CommentTypeID:   params.CommentType,
			Content:         g.Content,
			Status:          domain.CommentStatusProposed,
			PostedBy:        "AI",
		})
		if err != nil {
			return nil, err
		}
		result = append(result, c)
	}

	return result, nil
}

func (cg *CommentGenerator) buildPrompt(discussion *domain.Discussion, ancestors []*domain.Comment, commentType string) string {
	var sb strings.Builder
	fmt.Fprintf(&sb, "Discussion Theme: %s\n", discussion.Theme())
	if len(ancestors) > 0 {
		sb.WriteString("Context:\n")
		for i, c := range ancestors {
			fmt.Fprintf(&sb, "%d. %s: %s\n", i+1, c.CommentType(), c.Content())
		}
	}
	fmt.Fprintf(&sb, "\n\nBased on the context above, generate 3 appropriate comments as \"%s\".\n", commentType)
	fmt.Fprintf(&sb, "Each comment should be concise.\n")
	fmt.Fprintf(&sb, "The language of the generated content must match the language used in the discussion theme and previous comments.")
	return sb.String()
}
