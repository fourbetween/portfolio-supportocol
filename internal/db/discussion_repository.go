package db

import (
	"errors"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal"
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

func (r *DiscussionRepository) Load(params discussion.LoadParams) (*discussion.Discussion, error) {
	stmt := postgres.
		SELECT(table.Discussions.AllColumns).
		FROM(table.Discussions).
		WHERE(table.Discussions.ID.EQ(postgres.String(params.ID)))

	var dest model.Discussions
	if err := stmt.Query(r.db, &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, internal.ErrNotFound
		}
		return nil, fmt.Errorf("failed to load discussion: %w", err)
	}

	return r.fac.BuildDiscussion(discussion.BuildDiscussionParams{
		ID: dest.ID,
		NewDiscussionParams: discussion.NewDiscussionParams{
			Theme:                  dest.Theme,
			Background:             dest.Background,
			Conclusion:             dest.Conclusion,
			RuleID:                 dest.RuleID,
			VisibilityLevel:        discussion.VisibilityLevel(dest.VisibilityLevel),
			CommentPermissionLevel: discussion.CommentPermissionLevel(dest.CommentPermissionLevel),
			CreatedBy:              dest.CreatedBy,
			Status:                 discussion.Status(dest.Status),
		},
		CreatedAt: dest.CreatedAt,
	}), nil
}

func (r *DiscussionRepository) Save(d *discussion.Discussion) error {
	model := model.Discussions{
		ID:                     d.ID(),
		Theme:                  d.Theme(),
		Background:             d.Background(),
		Conclusion:             d.Conclusion(),
		RuleID:                 d.RuleID(),
		VisibilityLevel:        string(d.VisibilityLevel()),
		CommentPermissionLevel: string(d.CommentPermissionLevel()),
		CreatedBy:              d.CreatedBy(),
		CreatedAt:              d.CreatedAt(),
		Status:                 string(d.Status()),
	}

	stmt := table.Discussions.
		INSERT(table.Discussions.AllColumns).
		MODEL(model).
		ON_CONFLICT(table.Discussions.ID).
		DO_UPDATE(
			postgres.SET(
				table.Discussions.Theme.SET(postgres.String(d.Theme())),
				table.Discussions.Background.SET(postgres.String(d.Background())),
				table.Discussions.Conclusion.SET(postgres.String(d.Conclusion())),
				table.Discussions.RuleID.SET(postgres.String(d.RuleID())),
				table.Discussions.VisibilityLevel.SET(postgres.String(string(d.VisibilityLevel()))),
				table.Discussions.CommentPermissionLevel.SET(postgres.String(string(d.CommentPermissionLevel()))),
				table.Discussions.Status.SET(postgres.String(string(d.Status()))),
			),
		)

	if _, err := stmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to save discussion: %w", err)
	}
	return nil
}

func (r *DiscussionRepository) Delete(d *discussion.Discussion) error {
	stmt := table.Discussions.
		DELETE().
		WHERE(table.Discussions.ID.EQ(postgres.String(d.ID())))

	if _, err := stmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to delete discussion: %w", err)
	}
	return nil
}
