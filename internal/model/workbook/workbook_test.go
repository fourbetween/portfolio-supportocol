package workbook_test

import (
	"testing"

	"github.com/fourbetween/app-supportocol/internal/model/workbook"
	"github.com/google/go-cmp/cmp"
)

func TestWorkbook_IsPublished(t *testing.T) {
	tests := []struct {
		name   string
		status workbook.Status
		want   bool
	}{
		{
			name:   "公開済みの場合にtrueを返すこと",
			status: workbook.StatusPublished,
			want:   true,
		},
		{
			name:   "ドラフトの場合にfalseを返すこと",
			status: workbook.StatusDraft,
			want:   false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			w := con.WorkbookFac.BuildWorkbook(workbook.BuildWorkbookParams{
				ID: "test-id",
				NewWorkbookParams: workbook.NewWorkbookParams{
					Title:   "test-title",
					Status:  tt.status,
					OwnerID: "test-owner",
				},
			})
			got := w.IsPublished()
			if diff := cmp.Diff(tt.want, got); diff != "" {
				t.Errorf("IsPublished() mismatch (-want +got):\n%s", diff)
			}
		})
	}
}
