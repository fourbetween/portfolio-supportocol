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
		name    string // description of this test case
		want    []*discussion.Issue
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// TODO: construct the receiver type.
			var d discussion.Discussion
			got, gotErr := d.Issues()
			if gotErr != nil {
				if !tt.wantErr {
					t.Errorf("Issues() failed: %v", gotErr)
				}
				return
			}
			if tt.wantErr {
				t.Fatal("Issues() succeeded unexpectedly")
			}
			// TODO: update the condition below to compare got with tt.want.
			if true {
				t.Errorf("Issues() = %v, want %v", got, tt.want)
			}
		})
	}
}
