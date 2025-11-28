package discussion_test

import (
	"testing"

	"github.com/fourbetween/app-supportocol/internal/model/discussion"
	"github.com/fourbetween/app-supportocol/internal/service/clock"
	"github.com/fourbetween/app-supportocol/internal/service/id"
	"github.com/google/go-cmp/cmp"
	gomock "go.uber.org/mock/gomock"
)

type (
	container struct {
		DiscussionFac  *discussion.Factory
		DiscussionRepo *discussion.MockRepository
	}
)

func newContainer(t *testing.T) *container {
	ctrl := gomock.NewController(t)

	idSrv := id.NewULIDService()
	clockSrv := clock.NewRealService()
	discussionRepo := discussion.NewMockRepository(ctrl)
	discussionFac := discussion.NewFactory(
		discussionRepo,
		idSrv,
		clockSrv,
	)
	return &container{
		DiscussionFac:  discussionFac,
		DiscussionRepo: discussionRepo,
	}
}

func TestDiscussion_ListComments(t *testing.T) {
	tests := []struct {
		name    string
		prepare func(c *container) *discussion.Discussion
		want    []*discussion.Comment
		wantErr bool
	}{
		{
			name: "コメントを取得できること",
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				comment := c.DiscussionFac.BuildComment(discussion.BuildCommentParams{
					ID: "comment1",
					NewCommentParams: discussion.NewCommentParams{
						DiscussionID: d.ID(),
						Content:      "content",
						PostedBy:     "user1",
					},
					Status: discussion.CommentStatusUnassigned,
				})
				c.DiscussionRepo.EXPECT().FetchComments(d.ID()).Return([]*discussion.Comment{
					comment,
				}, nil)
				return d
			},
			want: []*discussion.Comment{
				func() *discussion.Comment {
					c := newContainer(t)
					return c.DiscussionFac.BuildComment(discussion.BuildCommentParams{
						ID: "comment1",
						NewCommentParams: discussion.NewCommentParams{
							Content:  "content",
							PostedBy: "user1",
						},
						Status: discussion.CommentStatusUnassigned,
					})
				}(),
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newContainer(t)
			d := tt.prepare(c)
			got, err := d.ListComments()
			if (err != nil) != tt.wantErr {
				t.Errorf("Discussion.ListComments() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if len(got) != len(tt.want) {
					t.Errorf("Discussion.ListComments() len = %d, want %d", len(got), len(tt.want))
					return
				}
				for i := range got {
					if got[i].ID() != tt.want[i].ID() {
						t.Errorf("Discussion.ListComments()[%d].ID() = %v, want %v", i, got[i].ID(), tt.want[i].ID())
					}
				}
			}
		})
	}
}

func TestDiscussion_CreateComment(t *testing.T) {
	tests := []struct {
		name    string
		prepare func(c *container) *discussion.Discussion
		params  discussion.CreateCommentParams
		wantErr bool
	}{
		{
			name: "コメントを作成できること",
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				c.DiscussionRepo.EXPECT().SaveComment(gomock.Any()).Return(nil)
				return d
			},
			params: discussion.CreateCommentParams{
				ParentCommentID: "",
				CommentTypeID:   "type1",
				Content:         "test content",
				PostedBy:        "user1",
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newContainer(t)
			d := tt.prepare(c)
			got, err := d.CreateComment(tt.params)
			if (err != nil) != tt.wantErr {
				t.Errorf("Discussion.CreateComment() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if got.DiscussionID() != d.ID() {
					t.Errorf("Discussion.CreateComment().DiscussionID() = %v, want %v", got.DiscussionID(), d.ID())
				}
				if got.Content() != tt.params.Content {
					t.Errorf("Discussion.CreateComment().Content() = %v, want %v", got.Content(), tt.params.Content)
				}
				if got.PostedBy() != tt.params.PostedBy {
					t.Errorf("Discussion.CreateComment().PostedBy() = %v, want %v", got.PostedBy(), tt.params.PostedBy)
				}
				if got.Status() != discussion.CommentStatusUnassigned {
					t.Errorf("Discussion.CreateComment().Status() = %v, want %v", got.Status(), discussion.CommentStatusUnassigned)
				}
			}
		})
	}
}

func TestDiscussion_UpdateComment(t *testing.T) {
	tests := []struct {
		name    string
		prepare func(c *container) (*discussion.Discussion, *discussion.Comment)
		params  discussion.DiscussionUpdateCommentParams
		wantErr bool
	}{
		{
			name: "コメントを更新できること",
			prepare: func(c *container) (*discussion.Discussion, *discussion.Comment) {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				comment := c.DiscussionFac.BuildComment(discussion.BuildCommentParams{
					ID: "comment1",
					NewCommentParams: discussion.NewCommentParams{
						DiscussionID: d.ID(),
						Content:      "original content",
						PostedBy:     "user1",
					},
					Status: discussion.CommentStatusUnassigned,
				})
				c.DiscussionRepo.EXPECT().LoadComment(discussion.LoadCommentParams{
					DiscussionID: d.ID(),
					CommentID:    "comment1",
				}).Return(comment, nil)
				c.DiscussionRepo.EXPECT().SaveComment(gomock.Any()).Return(nil)
				return d, comment
			},
			params: discussion.DiscussionUpdateCommentParams{
				CommentID: "comment1",
				Content:   "updated content",
				Status:    discussion.CommentStatusAssigned,
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newContainer(t)
			d, _ := tt.prepare(c)
			got, err := d.UpdateComment(tt.params)
			if (err != nil) != tt.wantErr {
				t.Errorf("Discussion.UpdateComment() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if got.Content() != tt.params.Content {
					t.Errorf("Discussion.UpdateComment().Content() = %v, want %v", got.Content(), tt.params.Content)
				}
				if got.Status() != tt.params.Status {
					t.Errorf("Discussion.UpdateComment().Status() = %v, want %v", got.Status(), tt.params.Status)
				}
			}
		})
	}
}

func TestDiscussion_DeleteComment(t *testing.T) {
	tests := []struct {
		name      string
		prepare   func(c *container) *discussion.Discussion
		commentID string
		wantErr   bool
	}{
		{
			name: "コメントを削除できること",
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				comment := c.DiscussionFac.BuildComment(discussion.BuildCommentParams{
					ID: "comment1",
					NewCommentParams: discussion.NewCommentParams{
						DiscussionID: d.ID(),
						Content:      "content",
						PostedBy:     "user1",
					},
					Status: discussion.CommentStatusUnassigned,
				})
				c.DiscussionRepo.EXPECT().LoadComment(discussion.LoadCommentParams{
					DiscussionID: d.ID(),
					CommentID:    "comment1",
				}).Return(comment, nil)
				c.DiscussionRepo.EXPECT().DeleteComment(gomock.Any()).Return(nil)
				return d
			},
			commentID: "comment1",
			wantErr:   false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newContainer(t)
			d := tt.prepare(c)
			err := d.DeleteComment(tt.commentID)
			if (err != nil) != tt.wantErr {
				t.Errorf("Discussion.DeleteComment() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestDiscussion_Issues(t *testing.T) {
	tests := []struct {
		name    string
		prepare func(c *container) *discussion.Discussion
		want    []discussion.Issue
		wantErr bool
	}{
		{
			name: "指摘を取得できること",
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				c.DiscussionRepo.EXPECT().FetchIssues(d.ID()).Return([]discussion.Issue{
					{ID: "issue1"},
				}, nil)
				return d
			},
			want: []discussion.Issue{
				{ID: "issue1"},
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newContainer(t)
			d := tt.prepare(c)
			got, err := d.Issues()
			if (err != nil) != tt.wantErr {
				t.Errorf("Discussion.Issues() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if diff := cmp.Diff(tt.want, got); diff != "" {
					t.Errorf("Discussion.Issues() mismatch (-want +got):\n%s", diff)
				}
			}
		})
	}
}

func TestDiscussion_Notes(t *testing.T) {
	tests := []struct {
		name    string
		prepare func(c *container) *discussion.Discussion
		want    []discussion.Note
		wantErr bool
	}{
		{
			name: "ノートを取得できること",
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				c.DiscussionRepo.EXPECT().FetchNotes(d.ID()).Return([]discussion.Note{
					{ID: "note1"},
				}, nil)
				return d
			},
			want: []discussion.Note{
				{ID: "note1"},
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newContainer(t)
			d := tt.prepare(c)
			got, err := d.Notes()
			if (err != nil) != tt.wantErr {
				t.Errorf("Discussion.Notes() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if diff := cmp.Diff(tt.want, got); diff != "" {
					t.Errorf("Discussion.Notes() mismatch (-want +got):\n%s", diff)
				}
			}
		})
	}
}
