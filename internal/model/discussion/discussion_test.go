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

func TestDiscussion_Comments(t *testing.T) {
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
				c.DiscussionRepo.EXPECT().FetchComments(d.ID()).Return([]*discussion.Comment{
					{ID: "comment1"},
				}, nil)
				return d
			},
			want: []*discussion.Comment{
				{ID: "comment1"},
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := newContainer(t)
			d := tt.prepare(c)
			got, err := d.Comments()
			if (err != nil) != tt.wantErr {
				t.Errorf("Discussion.Comments() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if diff := cmp.Diff(tt.want, got); diff != "" {
					t.Errorf("Discussion.Comments() mismatch (-want +got):\n%s", diff)
				}
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
				c.DiscussionRepo.EXPECT().FetchIssues(d.ID()).Return([]*discussion.Issue{
					{ID: "issue1"},
				}, nil)
				return d
			},
			want: []*discussion.Issue{
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
				c.DiscussionRepo.EXPECT().FetchNotes(d.ID()).Return([]*discussion.Note{
					{ID: "note1"},
				}, nil)
				return d
			},
			want: []*discussion.Note{
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
