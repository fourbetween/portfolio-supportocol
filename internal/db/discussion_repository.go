package db

import (
	"errors"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal"
	"github.com/fourbetween/app-supportocol/internal/db/.gen/app-supportocol/model"
	"github.com/fourbetween/app-supportocol/internal/db/.gen/app-supportocol/table"
	"github.com/fourbetween/app-supportocol/internal/model/discussion"
	"github.com/go-jet/jet/v2/mysql"
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
	cond := mysql.Bool(true)
	if params.ProjectID != "" {
		cond = cond.AND(table.ProjectDiscussions.ProjectID.EQ(mysql.String(params.ProjectID)))
	}
	if params.CreatedBy != "" {
		cond = cond.AND(table.Discussions.CreatedBy.EQ(mysql.String(params.CreatedBy)))
	}

	var from mysql.ReadableTable = table.Discussions
	if params.ProjectID != "" {
		from = from.INNER_JOIN(table.ProjectDiscussions, table.ProjectDiscussions.DiscussionID.EQ(table.Discussions.ID))
	}

	stmt := mysql.
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
	cond := table.Discussions.ID.EQ(mysql.String(params.ID))
	if params.CreatedBy != "" {
		cond = cond.AND(table.Discussions.CreatedBy.EQ(mysql.String(params.CreatedBy)))
	}

	stmt := mysql.
		SELECT(table.Discussions.AllColumns).
		FROM(table.Discussions).
		WHERE(cond)

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
		INSERT(table.Discussions.AllColumns.Except(table.Discussions.UpdatedAt)).
		MODEL(model).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Discussions.Theme.SET(table.Discussions.NEW.Theme),
			table.Discussions.Background.SET(table.Discussions.NEW.Background),
			table.Discussions.Conclusion.SET(table.Discussions.NEW.Conclusion),
			table.Discussions.RuleID.SET(table.Discussions.NEW.RuleID),
			table.Discussions.VisibilityLevel.SET(table.Discussions.NEW.VisibilityLevel),
			table.Discussions.CommentPermissionLevel.SET(table.Discussions.NEW.CommentPermissionLevel),
			table.Discussions.Status.SET(table.Discussions.NEW.Status),
		)

	if _, err := stmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to save discussion: %w", err)
	}
	return nil
}

func (r *DiscussionRepository) Delete(d *discussion.Discussion) error {
	stmt := table.Discussions.
		DELETE().
		WHERE(table.Discussions.ID.EQ(mysql.String(d.ID())))

	if _, err := stmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to delete discussion: %w", err)
	}
	return nil
}

func (r *DiscussionRepository) ExistsByRuleID(ruleID string) (bool, error) {
	stmt := mysql.
		SELECT(table.Discussions.ID).
		FROM(table.Discussions).
		WHERE(table.Discussions.RuleID.EQ(mysql.String(ruleID))).
		LIMIT(1)

	var dest model.Discussions
	if err := stmt.Query(r.db, &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return false, nil
		}
		return false, fmt.Errorf("failed to check if discussion exists by rule ID: %w", err)
	}

	return true, nil
}

func (r *DiscussionRepository) FetchComments(discussionID string) ([]*discussion.Comment, error) {
	stmt := mysql.
		SELECT(table.Comments.AllColumns).
		FROM(table.Comments).
		WHERE(table.Comments.DiscussionID.EQ(mysql.String(discussionID)))

	var dest []model.Comments
	if err := stmt.Query(r.db, &dest); err != nil {
		return nil, fmt.Errorf("failed to fetch comments: %w", err)
	}

	comments := make([]*discussion.Comment, len(dest))
	for i, row := range dest {
		comments[i] = r.toCommentDomain(row)
	}

	return comments, nil
}

func (r *DiscussionRepository) LoadComment(params discussion.LoadCommentParams) (*discussion.Comment, error) {
	stmt := mysql.
		SELECT(table.Comments.AllColumns).
		FROM(table.Comments).
		WHERE(mysql.AND(
			table.Comments.DiscussionID.EQ(mysql.String(params.DiscussionID)),
			table.Comments.ID.EQ(mysql.String(params.CommentID)),
		))

	var dest model.Comments
	if err := stmt.Query(r.db, &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, internal.ErrNotFound
		}
		return nil, fmt.Errorf("failed to load comment: %w", err)
	}

	return r.toCommentDomain(dest), nil
}

func (r *DiscussionRepository) SaveComment(c *discussion.Comment) error {
	model := r.toCommentModel(c)

	stmt := table.Comments.
		INSERT(table.Comments.AllColumns).
		MODEL(model).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Comments.Content.SET(table.Comments.NEW.Content),
			table.Comments.Status.SET(table.Comments.NEW.Status),
		)

	if _, err := stmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to save comment: %w", err)
	}
	return nil
}

func (r *DiscussionRepository) DeleteComment(c *discussion.Comment) error {
	stmt := table.Comments.
		DELETE().
		WHERE(table.Comments.ID.EQ(mysql.String(c.ID())))

	if _, err := stmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}
	return nil
}

func (r *DiscussionRepository) FetchIssues(discussionID string) ([]*discussion.Issue, error) {
	stmt := mysql.
		SELECT(table.Issues.AllColumns).
		FROM(
			table.Issues.
				INNER_JOIN(table.Comments, table.Comments.ID.EQ(table.Issues.CommentID)),
		).
		WHERE(table.Comments.DiscussionID.EQ(mysql.String(discussionID)))

	var dest []model.Issues
	if err := stmt.Query(r.db, &dest); err != nil {
		return nil, fmt.Errorf("failed to fetch issues: %w", err)
	}

	issues := make([]*discussion.Issue, len(dest))
	for i, row := range dest {
		issues[i] = r.toIssueDomain(row)
	}

	return issues, nil
}

func (r *DiscussionRepository) LoadIssue(params discussion.LoadIssueParams) (*discussion.Issue, error) {
	stmt := mysql.
		SELECT(table.Issues.AllColumns).
		FROM(
			table.Issues.
				INNER_JOIN(table.Comments, table.Comments.ID.EQ(table.Issues.CommentID)),
		).
		WHERE(
			table.Issues.ID.EQ(mysql.String(params.IssueID)).
				AND(table.Comments.DiscussionID.EQ(mysql.String(params.DiscussionID))),
		)

	var dest model.Issues
	if err := stmt.Query(r.db, &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, internal.ErrNotFound
		}
		return nil, fmt.Errorf("failed to load issue: %w", err)
	}

	return r.toIssueDomain(dest), nil
}

func (r *DiscussionRepository) SaveIssue(issue *discussion.Issue) error {
	mdl := r.toIssueModel(issue)
	stmt := table.Issues.
		INSERT(table.Issues.AllColumns).
		MODEL(mdl).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Issues.IssueType.SET(table.Issues.NEW.IssueType),
			table.Issues.Description.SET(table.Issues.NEW.Description),
		)

	if _, err := stmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to save issue: %w", err)
	}
	return nil
}

func (r *DiscussionRepository) DeleteIssue(issue *discussion.Issue) error {
	stmt := table.Issues.
		DELETE().
		WHERE(table.Issues.ID.EQ(mysql.String(issue.ID())))

	if _, err := stmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to delete issue: %w", err)
	}
	return nil
}

func (r *DiscussionRepository) FetchNotes(discussionID string) ([]*discussion.Note, error) {
	stmt := mysql.
		SELECT(table.Notes.AllColumns).
		FROM(table.Notes).
		WHERE(table.Notes.DiscussionID.EQ(mysql.String(discussionID)))

	var dest []model.Notes
	if err := stmt.Query(r.db, &dest); err != nil {
		return nil, fmt.Errorf("failed to fetch notes: %w", err)
	}

	notes := make([]*discussion.Note, len(dest))
	for i, row := range dest {
		notes[i] = r.toNoteDomain(row)
	}

	return notes, nil
}

func (r *DiscussionRepository) LoadNote(params discussion.LoadNoteParams) (*discussion.Note, error) {
	stmt := mysql.
		SELECT(table.Notes.AllColumns).
		FROM(table.Notes).
		WHERE(
			table.Notes.ID.EQ(mysql.String(params.NoteID)).
				AND(table.Notes.DiscussionID.EQ(mysql.String(params.DiscussionID))),
		)

	var dest model.Notes
	if err := stmt.Query(r.db, &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, internal.ErrNotFound
		}
		return nil, fmt.Errorf("failed to load note: %w", err)
	}

	return r.toNoteDomain(dest), nil
}

func (r *DiscussionRepository) SaveNote(note *discussion.Note) error {
	mdl := r.toNoteModel(note)
	stmt := table.Notes.
		INSERT(table.Notes.AllColumns).
		MODEL(mdl).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Notes.Content.SET(table.Notes.NEW.Content),
		)

	if _, err := stmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to save note: %w", err)
	}
	return nil
}

func (r *DiscussionRepository) DeleteNote(note *discussion.Note) error {
	stmt := table.Notes.
		DELETE().
		WHERE(table.Notes.ID.EQ(mysql.String(note.ID())))

	if _, err := stmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to delete note: %w", err)
	}
	return nil
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

func (r *DiscussionRepository) toCommentDomain(row model.Comments) *discussion.Comment {
	return r.fac.BuildComment(discussion.BuildCommentParams{
		ID: row.ID,
		NewCommentParams: discussion.NewCommentParams{
			DiscussionID:    row.DiscussionID,
			ParentCommentID: ptrToString(row.ParentCommentID),
			CommentTypeID:   row.CommentTypeID,
			Content:         row.Content,
			PostedBy:        row.PostedBy,
		},
		CreatedAt: row.CreatedAt,
		Status:    discussion.CommentStatus(row.Status),
	})
}

func (r *DiscussionRepository) toCommentModel(c *discussion.Comment) model.Comments {
	return model.Comments{
		ID:              c.ID(),
		DiscussionID:    c.DiscussionID(),
		ParentCommentID: stringToPtr(c.ParentCommentID()),
		CommentTypeID:   c.CommentTypeID(),
		Content:         c.Content(),
		PostedBy:        c.PostedBy(),
		CreatedAt:       c.CreatedAt(),
		Status:          string(c.Status()),
	}
}

func (r *DiscussionRepository) toIssueDomain(row model.Issues) *discussion.Issue {
	return r.fac.BuildIssue(discussion.BuildIssueParams{
		ID: row.ID,
		NewIssueParams: discussion.NewIssueParams{
			CommentID:   row.CommentID,
			IssueType:   discussion.IssueType(row.IssueType),
			Description: row.Description,
			CreatedBy:   row.CreatedBy,
		},
		CreatedAt: row.CreatedAt,
	})
}

func (r *DiscussionRepository) toNoteDomain(row model.Notes) *discussion.Note {
	return r.fac.BuildNote(discussion.BuildNoteParams{
		ID: row.ID,
		NewNoteParams: discussion.NewNoteParams{
			DiscussionID: row.DiscussionID,
			Content:      row.Content,
			PostedBy:     row.PostedBy,
		},
		CreatedAt: row.CreatedAt,
	})
}

func (r *DiscussionRepository) toIssueModel(i *discussion.Issue) model.Issues {
	return model.Issues{
		ID:          i.ID(),
		CommentID:   i.CommentID(),
		IssueType:   string(i.IssueType()),
		Description: i.Description(),
		CreatedBy:   i.CreatedBy(),
		CreatedAt:   i.CreatedAt(),
	}
}

func (r *DiscussionRepository) toNoteModel(n *discussion.Note) model.Notes {
	return model.Notes{
		ID:           n.ID(),
		DiscussionID: n.DiscussionID(),
		Content:      n.Content(),
		PostedBy:     n.PostedBy(),
		CreatedAt:    n.CreatedAt(),
	}
}
