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
	cond := postgres.Bool(true)
	if params.ProjectID != "" {
		cond = table.ProjectDiscussions.ProjectID.EQ(postgres.String(params.ProjectID))
	}

	var from postgres.ReadableTable = table.Discussions
	if params.ProjectID != "" {
		from = from.INNER_JOIN(table.ProjectDiscussions, table.ProjectDiscussions.DiscussionID.EQ(table.Discussions.ID))
	}

	stmt := postgres.
		SELECT(table.Discussions.AllColumns).
		FROM(from).
		WHERE(cond)

	var dest []model.Discussions
	if err := stmt.Query(r.db, &dest); err != nil {
		return nil, fmt.Errorf("failed to query discussions: %w", err)
	}

	discussions := make([]*discussion.Discussion, len(dest))
	for i, row := range dest {
		discussions[i] = r.toDomain(row)
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

	return r.toDomain(dest), nil
}

func (r *DiscussionRepository) Save(d *discussion.Discussion) error {
	model := r.toModel(d)

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

func (r *DiscussionRepository) FetchComments(discussionID string) ([]discussion.Comment, error) {
	stmt := postgres.
		SELECT(table.Comments.AllColumns).
		FROM(table.Comments).
		WHERE(table.Comments.DiscussionID.EQ(postgres.String(discussionID)))

	var dest []model.Comments
	if err := stmt.Query(r.db, &dest); err != nil {
		return nil, fmt.Errorf("failed to fetch comments: %w", err)
	}

	comments := make([]discussion.Comment, len(dest))
	for i, row := range dest {
		comments[i] = r.toCommentDomain(row)
	}

	return comments, nil
}

func (r *DiscussionRepository) FetchIssues(discussionID string) ([]discussion.Issue, error) {
	stmt := postgres.
		SELECT(table.Issues.AllColumns).
		FROM(
			table.Issues.
				INNER_JOIN(table.Comments, table.Comments.ID.EQ(table.Issues.CommentID)),
		).
		WHERE(table.Comments.DiscussionID.EQ(postgres.String(discussionID)))

	var dest []model.Issues
	if err := stmt.Query(r.db, &dest); err != nil {
		return nil, fmt.Errorf("failed to fetch issues: %w", err)
	}

	issues := make([]discussion.Issue, len(dest))
	for i, row := range dest {
		issues[i] = r.toIssueDomain(row)
	}

	return issues, nil
}

func (r *DiscussionRepository) FetchNotes(discussionID string) ([]discussion.Note, error) {
	stmt := postgres.
		SELECT(table.Notes.AllColumns).
		FROM(table.Notes).
		WHERE(table.Notes.DiscussionID.EQ(postgres.String(discussionID)))

	var dest []model.Notes
	if err := stmt.Query(r.db, &dest); err != nil {
		return nil, fmt.Errorf("failed to fetch notes: %w", err)
	}

	notes := make([]discussion.Note, len(dest))
	for i, row := range dest {
		notes[i] = r.toNoteDomain(row)
	}

	return notes, nil
}

func (r *DiscussionRepository) toDomain(row model.Discussions) *discussion.Discussion {
	return r.fac.BuildDiscussion(discussion.BuildDiscussionParams{
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

func (r *DiscussionRepository) toModel(d *discussion.Discussion) model.Discussions {
	return model.Discussions{
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
}

func (r *DiscussionRepository) toCommentDomain(row model.Comments) discussion.Comment {
	return discussion.Comment{
		ID:              row.ID,
		DiscussionID:    row.DiscussionID,
		ParentCommentID: row.ParentCommentID,
		CommentTypeID:   row.CommentTypeID,
		Content:         row.Content,
		PostedBy:        row.PostedBy,
		PostedAt:        row.PostedAt,
		Status:          discussion.CommentStatus(row.Status),
	}
}

func (r *DiscussionRepository) toIssueDomain(row model.Issues) discussion.Issue {
	return discussion.Issue{
		ID:          row.ID,
		CommentID:   row.CommentID,
		IssueType:   discussion.IssueType(row.IssueType),
		Description: row.Description,
		CreatedBy:   row.CreatedBy,
		CreatedAt:   row.CreatedAt,
	}
}

func (r *DiscussionRepository) toNoteDomain(row model.Notes) discussion.Note {
	return discussion.Note{
		ID:           row.ID,
		DiscussionID: row.DiscussionID,
		Content:      row.Content,
		PostedBy:     row.PostedBy,
		PostedAt:     row.PostedAt,
	}
}
