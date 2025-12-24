package discussion_test

import (
	"testing"
	"time"

	"github.com/fourbetween/app-supportocol/internal/model/discussion"
	"github.com/fourbetween/app-supportocol/internal/model/rule"
	"github.com/fourbetween/app-supportocol/internal/service/clock"
	id "github.com/fourbetween/pkg-id"
	gomock "go.uber.org/mock/gomock"
)

type (
	container struct {
		DiscussionFac  *discussion.Factory
		DiscussionRepo *discussion.MockRepository
		RuleRepo       *rule.MockRepository
		RuleFac        *rule.Factory
	}
)

func newContainer(t *testing.T) *container {
	ctrl := gomock.NewController(t)

	idSrv := id.NewMockService(ctrl)
	idSrv.EXPECT().Generate().Return("test-id").AnyTimes()
	clockSrv := clock.NewRealService()
	discussionRepo := discussion.NewMockRepository(ctrl)
	ruleRepo := rule.NewMockRepository(ctrl)
	ruleFac := rule.NewFactory(ruleRepo, idSrv)
	discussionFac := discussion.NewFactory(
		discussionRepo,
		idSrv,
		clockSrv,
		ruleRepo,
	)
	return &container{
		DiscussionFac:  discussionFac,
		DiscussionRepo: discussionRepo,
		RuleRepo:       ruleRepo,
		RuleFac:        ruleFac,
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
			name: "ルートコメントを作成できること",
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				// CommentType.Root=trueでルートコメントを許可
				rl := c.RuleFac.BuildRule(rule.BuildRuleParams{
					ID: "ruleID",
					NewRuleParams: rule.NewRuleParams{
						Name:      "test-rule",
						CreatedAt: time.Now(),
						CommentTypes: []rule.CommentType{
							{ID: "type1", Name: "type1", Root: true},
						},
					},
				})
				c.RuleRepo.EXPECT().Load(rule.LoadParams{ID: "ruleID"}).Return(rl, nil)
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
		{
			name: "ルールに違反するルートコメントはエラーになること",
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				rl := c.RuleFac.BuildRule(rule.BuildRuleParams{
					ID: "ruleID",
					NewRuleParams: rule.NewRuleParams{
						Name:             "test-rule",
						CreatedAt:        time.Now(),
						CommentTypePaths: []rule.CommentTypePath{},
					},
				})
				c.RuleRepo.EXPECT().Load(rule.LoadParams{ID: "ruleID"}).Return(rl, nil)
				return d
			},
			params: discussion.CreateCommentParams{
				ParentCommentID: "",
				CommentTypeID:   "invalidType",
				Content:         "test content",
				PostedBy:        "user1",
			},
			wantErr: true,
		},
		{
			name: "親コメントに対するコメントを作成できること",
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				parentComment := c.DiscussionFac.BuildComment(discussion.BuildCommentParams{
					ID: "parentComment1",
					NewCommentParams: discussion.NewCommentParams{
						DiscussionID:  d.ID(),
						CommentTypeID: "type1",
						Content:       "parent content",
						PostedBy:      "user1",
					},
					Status: discussion.CommentStatusUnassigned,
				})
				c.DiscussionRepo.EXPECT().LoadComment(discussion.LoadCommentParams{
					DiscussionID: d.ID(),
					CommentID:    "parentComment1",
				}).Return(parentComment, nil)
				// From=子コメント(type2), To=親コメント(type1)
				rl := c.RuleFac.BuildRule(rule.BuildRuleParams{
					ID: "ruleID",
					NewRuleParams: rule.NewRuleParams{
						Name:      "test-rule",
						CreatedAt: time.Now(),
						CommentTypePaths: []rule.CommentTypePath{
							{ChildCommentTypeID: "type2", ParentCommentTypeID: "type1"},
						},
					},
				})
				c.RuleRepo.EXPECT().Load(rule.LoadParams{ID: "ruleID"}).Return(rl, nil)
				c.DiscussionRepo.EXPECT().SaveComment(gomock.Any()).Return(nil)
				return d
			},
			params: discussion.CreateCommentParams{
				ParentCommentID: "parentComment1",
				CommentTypeID:   "type2",
				Content:         "child content",
				PostedBy:        "user1",
			},
			wantErr: false,
		},
		{
			name: "ルールに違反する子コメントはエラーになること",
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				parentComment := c.DiscussionFac.BuildComment(discussion.BuildCommentParams{
					ID: "parentComment1",
					NewCommentParams: discussion.NewCommentParams{
						DiscussionID:  d.ID(),
						CommentTypeID: "type1",
						Content:       "parent content",
						PostedBy:      "user1",
					},
					Status: discussion.CommentStatusUnassigned,
				})
				c.DiscussionRepo.EXPECT().LoadComment(discussion.LoadCommentParams{
					DiscussionID: d.ID(),
					CommentID:    "parentComment1",
				}).Return(parentComment, nil)
				rl := c.RuleFac.BuildRule(rule.BuildRuleParams{
					ID: "ruleID",
					NewRuleParams: rule.NewRuleParams{
						Name:             "test-rule",
						CreatedAt:        time.Now(),
						CommentTypePaths: []rule.CommentTypePath{},
					},
				})
				c.RuleRepo.EXPECT().Load(rule.LoadParams{ID: "ruleID"}).Return(rl, nil)
				return d
			},
			params: discussion.CreateCommentParams{
				ParentCommentID: "parentComment1",
				CommentTypeID:   "invalidType",
				Content:         "child content",
				PostedBy:        "user1",
			},
			wantErr: true,
		},
		{
			// 経路のFrom=子コメント、To=親コメントの定義に従った正しいテスト
			// 親コメント(type1) に対して 子コメント(type2) を追加する場合、
			// パスは {FromCommentTypeID: "type2", ToCommentTypeID: "type1"} である必要がある
			name: "経路がFrom=子To=親の定義に従っていればコメントを作成できること",
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				parentComment := c.DiscussionFac.BuildComment(discussion.BuildCommentParams{
					ID: "parentComment1",
					NewCommentParams: discussion.NewCommentParams{
						DiscussionID:  d.ID(),
						CommentTypeID: "claim",
						Content:       "parent content",
						PostedBy:      "user1",
					},
					Status: discussion.CommentStatusUnassigned,
				})
				c.DiscussionRepo.EXPECT().LoadComment(discussion.LoadCommentParams{
					DiscussionID: d.ID(),
					CommentID:    "parentComment1",
				}).Return(parentComment, nil)
				// From=子コメント(evidence), To=親コメント(claim)
				rl := c.RuleFac.BuildRule(rule.BuildRuleParams{
					ID: "ruleID",
					NewRuleParams: rule.NewRuleParams{
						Name:      "test-rule",
						CreatedAt: time.Now(),
						CommentTypePaths: []rule.CommentTypePath{
							{ChildCommentTypeID: "evidence", ParentCommentTypeID: "claim"},
						},
					},
				})
				c.RuleRepo.EXPECT().Load(rule.LoadParams{ID: "ruleID"}).Return(rl, nil)
				c.DiscussionRepo.EXPECT().SaveComment(gomock.Any()).Return(nil)
				return d
			},
			params: discussion.CreateCommentParams{
				ParentCommentID: "parentComment1",
				CommentTypeID:   "evidence", // 子コメントのタイプ
				Content:         "child content",
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
		want    []*discussion.Issue
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
				issue := c.DiscussionFac.BuildIssue(discussion.BuildIssueParams{
					ID: "issue1",
					NewIssueParams: discussion.NewIssueParams{
						CommentID:   "comment1",
						IssueType:   discussion.IssueTypeContradiction,
						Description: "desc",
						CreatedBy:   "user1",
					},
				})
				c.DiscussionRepo.EXPECT().FetchIssues(d.ID()).Return([]*discussion.Issue{
					issue,
				}, nil)
				return d
			},
			want: []*discussion.Issue{
				func() *discussion.Issue {
					c := newContainer(t)
					return c.DiscussionFac.BuildIssue(discussion.BuildIssueParams{
						ID: "issue1",
						NewIssueParams: discussion.NewIssueParams{
							CommentID:   "comment1",
							IssueType:   discussion.IssueTypeContradiction,
							Description: "desc",
							CreatedBy:   "user1",
						},
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
			got, err := d.Issues()
			if (err != nil) != tt.wantErr {
				t.Errorf("Discussion.Issues() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if len(got) != len(tt.want) {
					t.Errorf("Discussion.Issues() len = %d, want %d", len(got), len(tt.want))
					return
				}
				for i := range got {
					if got[i].ID() != tt.want[i].ID() {
						t.Errorf("Discussion.Issues()[%d].ID() = %v, want %v", i, got[i].ID(), tt.want[i].ID())
					}
				}
			}
		})
	}
}

func TestDiscussion_Notes(t *testing.T) {
	tests := []struct {
		name    string
		prepare func(c *container) *discussion.Discussion
		want    []*discussion.Note
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
				note := c.DiscussionFac.BuildNote(discussion.BuildNoteParams{
					ID: "note1",
					NewNoteParams: discussion.NewNoteParams{
						DiscussionID: d.ID(),
						Content:      "content",
						PostedBy:     "user1",
					},
				})
				c.DiscussionRepo.EXPECT().FetchNotes(d.ID()).Return([]*discussion.Note{
					note,
				}, nil)
				return d
			},
			want: []*discussion.Note{
				func() *discussion.Note {
					c := newContainer(t)
					return c.DiscussionFac.BuildNote(discussion.BuildNoteParams{
						ID: "note1",
						NewNoteParams: discussion.NewNoteParams{
							Content:  "content",
							PostedBy: "user1",
						},
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
			got, err := d.Notes()
			if (err != nil) != tt.wantErr {
				t.Errorf("Discussion.Notes() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if len(got) != len(tt.want) {
					t.Errorf("Discussion.Notes() len = %d, want %d", len(got), len(tt.want))
					return
				}
				for i := range got {
					if got[i].ID() != tt.want[i].ID() {
						t.Errorf("Discussion.Notes()[%d].ID() = %v, want %v", i, got[i].ID(), tt.want[i].ID())
					}
				}
			}
		})
	}
}

func TestDiscussion_CreateIssue(t *testing.T) {
	tests := []struct {
		name    string
		params  discussion.CreateIssueParams
		prepare func(c *container) *discussion.Discussion
		verify  func(*testing.T, *discussion.Issue, error)
	}{
		{
			name: "指摘を作成できること",
			params: discussion.CreateIssueParams{
				CommentID:   "comment1",
				IssueType:   discussion.IssueTypeContradiction,
				Description: "矛盾があります",
				CreatedBy:   "user1",
			},
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				c.DiscussionRepo.EXPECT().SaveIssue(gomock.Any()).Return(nil)
				return d
			},
			verify: func(t *testing.T, got *discussion.Issue, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("CreateIssue() error = %v", err)
					return
				}
				if got.ID() == "" {
					t.Error("CreateIssue() ID is empty")
				}
				if got.CommentID() != "comment1" {
					t.Errorf("CreateIssue() CommentID = %v, want %v", got.CommentID(), "comment1")
				}
				if got.IssueType() != discussion.IssueTypeContradiction {
					t.Errorf("CreateIssue() IssueType = %v, want %v", got.IssueType(), discussion.IssueTypeContradiction)
				}
				if got.Description() != "矛盾があります" {
					t.Errorf("CreateIssue() Description = %v, want %v", got.Description(), "矛盾があります")
				}
				if got.CreatedBy() != "user1" {
					t.Errorf("CreateIssue() CreatedBy = %v, want %v", got.CreatedBy(), "user1")
				}
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newContainer(t)
			d := tt.prepare(c)
			got, err := d.CreateIssue(tt.params)
			if tt.verify != nil {
				tt.verify(t, got, err)
			}
		})
	}
}

func TestDiscussion_UpdateIssue(t *testing.T) {
	tests := []struct {
		name    string
		params  discussion.DiscussionUpdateIssueParams
		prepare func(c *container) *discussion.Discussion
		verify  func(*testing.T, *discussion.Issue, error)
	}{
		{
			name: "指摘を更新できること",
			params: discussion.DiscussionUpdateIssueParams{
				IssueID:     "issue1",
				IssueType:   discussion.IssueTypeCircularLogic,
				Description: "循環論法があります",
			},
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				issue := c.DiscussionFac.BuildIssue(discussion.BuildIssueParams{
					ID: "issue1",
					NewIssueParams: discussion.NewIssueParams{
						CommentID:   "comment1",
						IssueType:   discussion.IssueTypeContradiction,
						Description: "矛盾があります",
						CreatedBy:   "user1",
					},
				})
				c.DiscussionRepo.EXPECT().LoadIssue(discussion.LoadIssueParams{
					DiscussionID: d.ID(),
					IssueID:      "issue1",
				}).Return(issue, nil)
				c.DiscussionRepo.EXPECT().SaveIssue(gomock.Any()).Return(nil)
				return d
			},
			verify: func(t *testing.T, got *discussion.Issue, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("UpdateIssue() error = %v", err)
					return
				}
				if got.IssueType() != discussion.IssueTypeCircularLogic {
					t.Errorf("UpdateIssue() IssueType = %v, want %v", got.IssueType(), discussion.IssueTypeCircularLogic)
				}
				if got.Description() != "循環論法があります" {
					t.Errorf("UpdateIssue() Description = %v, want %v", got.Description(), "循環論法があります")
				}
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newContainer(t)
			d := tt.prepare(c)
			got, err := d.UpdateIssue(tt.params)
			if tt.verify != nil {
				tt.verify(t, got, err)
			}
		})
	}
}

func TestDiscussion_DeleteIssue(t *testing.T) {
	tests := []struct {
		name    string
		issueID string
		prepare func(c *container) *discussion.Discussion
		wantErr bool
	}{
		{
			name:    "指摘を削除できること",
			issueID: "issue1",
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				issue := c.DiscussionFac.BuildIssue(discussion.BuildIssueParams{
					ID: "issue1",
					NewIssueParams: discussion.NewIssueParams{
						CommentID:   "comment1",
						IssueType:   discussion.IssueTypeContradiction,
						Description: "矛盾があります",
						CreatedBy:   "user1",
					},
				})
				c.DiscussionRepo.EXPECT().LoadIssue(discussion.LoadIssueParams{
					DiscussionID: d.ID(),
					IssueID:      "issue1",
				}).Return(issue, nil)
				c.DiscussionRepo.EXPECT().DeleteIssue(gomock.Any()).Return(nil)
				return d
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newContainer(t)
			d := tt.prepare(c)
			err := d.DeleteIssue(tt.issueID)
			if (err != nil) != tt.wantErr {
				t.Errorf("Discussion.DeleteIssue() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestDiscussion_CreateNote(t *testing.T) {
	tests := []struct {
		name    string
		params  discussion.CreateNoteParams
		prepare func(c *container) *discussion.Discussion
		verify  func(*testing.T, *discussion.Note, error)
	}{
		{
			name: "ノートを作成できること",
			params: discussion.CreateNoteParams{
				Content:  "メモ内容",
				PostedBy: "user1",
			},
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				c.DiscussionRepo.EXPECT().SaveNote(gomock.Any()).Return(nil)
				return d
			},
			verify: func(t *testing.T, got *discussion.Note, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("CreateNote() error = %v", err)
					return
				}
				if got.ID() == "" {
					t.Error("CreateNote() ID is empty")
				}
				if got.Content() != "メモ内容" {
					t.Errorf("CreateNote() Content = %v, want %v", got.Content(), "メモ内容")
				}
				if got.PostedBy() != "user1" {
					t.Errorf("CreateNote() PostedBy = %v, want %v", got.PostedBy(), "user1")
				}
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newContainer(t)
			d := tt.prepare(c)
			got, err := d.CreateNote(tt.params)
			if tt.verify != nil {
				tt.verify(t, got, err)
			}
		})
	}
}

func TestDiscussion_UpdateNote(t *testing.T) {
	tests := []struct {
		name    string
		params  discussion.DiscussionUpdateNoteParams
		prepare func(c *container) *discussion.Discussion
		verify  func(*testing.T, *discussion.Note, error)
	}{
		{
			name: "ノートを更新できること",
			params: discussion.DiscussionUpdateNoteParams{
				NoteID:  "note1",
				Content: "更新されたメモ内容",
			},
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				note := c.DiscussionFac.BuildNote(discussion.BuildNoteParams{
					ID: "note1",
					NewNoteParams: discussion.NewNoteParams{
						DiscussionID: d.ID(),
						Content:      "元のメモ内容",
						PostedBy:     "user1",
					},
				})
				c.DiscussionRepo.EXPECT().LoadNote(discussion.LoadNoteParams{
					DiscussionID: d.ID(),
					NoteID:       "note1",
				}).Return(note, nil)
				c.DiscussionRepo.EXPECT().SaveNote(gomock.Any()).Return(nil)
				return d
			},
			verify: func(t *testing.T, got *discussion.Note, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("UpdateNote() error = %v", err)
					return
				}
				if got.Content() != "更新されたメモ内容" {
					t.Errorf("UpdateNote() Content = %v, want %v", got.Content(), "更新されたメモ内容")
				}
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newContainer(t)
			d := tt.prepare(c)
			got, err := d.UpdateNote(tt.params)
			if tt.verify != nil {
				tt.verify(t, got, err)
			}
		})
	}
}

func TestDiscussion_DeleteNote(t *testing.T) {
	tests := []struct {
		name    string
		noteID  string
		prepare func(c *container) *discussion.Discussion
		wantErr bool
	}{
		{
			name:   "ノートを削除できること",
			noteID: "note1",
			prepare: func(c *container) *discussion.Discussion {
				d := c.DiscussionFac.NewDiscussion(discussion.NewDiscussionParams{
					Theme:      "theme",
					Background: "background",
					Conclusion: "conclusion",
					RuleID:     "ruleID",
					CreatedBy:  "createdBy",
				})
				note := c.DiscussionFac.BuildNote(discussion.BuildNoteParams{
					ID: "note1",
					NewNoteParams: discussion.NewNoteParams{
						DiscussionID: d.ID(),
						Content:      "メモ内容",
						PostedBy:     "user1",
					},
				})
				c.DiscussionRepo.EXPECT().LoadNote(discussion.LoadNoteParams{
					DiscussionID: d.ID(),
					NoteID:       "note1",
				}).Return(note, nil)
				c.DiscussionRepo.EXPECT().DeleteNote(gomock.Any()).Return(nil)
				return d
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newContainer(t)
			d := tt.prepare(c)
			err := d.DeleteNote(tt.noteID)
			if (err != nil) != tt.wantErr {
				t.Errorf("Discussion.DeleteNote() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
