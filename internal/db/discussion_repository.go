package db

import (
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/db/.gen/public/model"
	"github.com/fourbetween/app-supportocol/internal/db/.gen/public/table"
	"github.com/fourbetween/app-supportocol/internal/model/discussion"
	"github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"
)

type DiscussionRepository struct {
	db  qrm.DB
	fac *discussion.Factory
}

func NewDiscussionRepository(db qrm.DB) *DiscussionRepository {
	return &DiscussionRepository{db: db}
}

func (r *DiscussionRepository) SetFactory(fac *discussion.Factory) {
	r.fac = fac
}

func (r *DiscussionRepository) Search(params discussion.SearchParams) ([]*discussion.Discussion, error) {
	stmt := postgres.
		SELECT(table.Discussions.AllColumns).
		FROM(
			table.Discussions.
				INNER_JOIN(table.ProjectDiscussions, table.ProjectDiscussions.DiscussionID.EQ(table.Discussions.ID)),
		).
		WHERE(table.ProjectDiscussions.ProjectID.EQ(postgres.String(params.ProjectID)))

	var dest []model.Discussions
	if err := stmt.Query(r.db, &dest); err != nil {
		return nil, fmt.Errorf("failed to query discussions: %w", err)
	}

	discussions := make([]*discussion.Discussion, len(dest))
	for i, row := range dest {
		discussions[i] = r.fac.BuildDiscussion(discussion.BuildDiscussionParams{
			ID: row.ID,
			NewDiscussionParams: discussion.NewDiscussionParams{
				Theme:                  row.Theme,
				Background:             row.Background,
				Conclusion:             row.Conclusion,
				RuleID:                 row.RuleID,
				VisibilityLevel:        discussion.VisibilityLevel(row.VisibilityLevel),
				CommentPermissionLevel: discussion.CommentPermissionLevel(row.CommentPermissionLevel),
				CreatedBy:              row.CreatedBy,
				Status:                 discussion.Status(row.Status),
			},
			CreatedAt: row.CreatedAt,
		})
	}

	return discussions, nil
}
