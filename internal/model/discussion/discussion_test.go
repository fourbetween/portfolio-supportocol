package discussion_test

import (
	"testing"

	"github.com/fourbetween/app-supportocol/internal/model/discussion"
	"github.com/google/go-cmp/cmp"
)

func TestDiscussion_IsOpen(t *testing.T) {
	tests := []struct {
		name   string
		status discussion.Status
		want   bool
	}{
		{
			name:   "オープン状態の場合にtrueを返すこと",
			status: discussion.StatusOpen,
			want:   true,
		},
		{
			name:   "クローズ状態の場合にfalseを返すこと",
			status: discussion.StatusClosed,
			want:   false,
		},
		{
			name:   "アーカイブ状態の場合にfalseを返すこと",
			status: discussion.StatusArchived,
			want:   false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			d := con.DiscussionFac.BuildDiscussion(discussion.BuildDiscussionParams{
				ID: "test-id",
				NewDiscussionParams: discussion.NewDiscussionParams{
					Theme:                  "test-theme",
					Background:             "test-background",
					Conclusion:             "test-conclusion",
					RuleID:                 "test-rule-id",
					VisibilityLevel:        discussion.VisibilityLevelEveryone,
					CommentPermissionLevel: discussion.CommentPermissionLevelEveryone,
					CreatedBy:              "test-user",
					Status:                 tt.status,
				},
			})
			got := d.IsOpen()
			if diff := cmp.Diff(tt.want, got); diff != "" {
				t.Errorf("IsOpen() mismatch (-want +got):\n%s", diff)
			}
		})
	}
}
