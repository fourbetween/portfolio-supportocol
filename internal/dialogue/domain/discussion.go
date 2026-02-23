package domain

import (
	"context"
	"fmt"
	"slices"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

const (
	MaxCommentsPerDiscussion = 200
)

type (
	DiscussionRepository interface {
		Load(ctx context.Context, params LoadDiscussionParams) (*Discussion, error)
		Save(ctx context.Context, discussion *Discussion) error
	}

	LoadDiscussionParams struct {
		ID          string
		WorkspaceID string
	}
)

type (
	DiscussionFactory struct{}

	ReconstructDiscussionParams struct {
		ID          string
		WorkspaceID string
		Content     DiscussionContent
		Status      DiscussionStatus
		Settings    DiscussionSettings
		Stats       DiscussionStats
		Activity    DiscussionActivity
	}
)

func NewDiscussionFactory() *DiscussionFactory {
	return &DiscussionFactory{}
}

func (f *DiscussionFactory) Reconstruct(params ReconstructDiscussionParams) (*Discussion, error) {
	return &Discussion{
		id:          params.ID,
		workspaceID: params.WorkspaceID,
		content:     params.Content,
		status:      params.Status,
		settings:    params.Settings,
		stats:       params.Stats,
		activity:    params.Activity,
	}, nil
}

type Discussion struct {
	id          string
	workspaceID string
	content     DiscussionContent
	status      DiscussionStatus
	settings    DiscussionSettings
	stats       DiscussionStats
	activity    DiscussionActivity
}

func (d *Discussion) ID() string {
	return d.id
}

func (d *Discussion) WorkspaceID() string {
	return d.workspaceID
}

func (d *Discussion) Theme() string {
	return d.content.Theme
}

func (d *Discussion) Premise() string {
	return d.content.Premise
}

func (d *Discussion) Conclusion() string {
	return d.content.Conclusion
}

func (d *Discussion) Status() DiscussionStatus {
	return d.status
}

func (d *Discussion) Settings() DiscussionSettings {
	return d.settings
}

func (d *Discussion) CommentsCount() int {
	return d.stats.CommentsCount
}

func (d *Discussion) ProposedCommentsCount() int {
	return d.stats.ProposedCommentsCount
}

func (d *Discussion) IssuesCount() int {
	return d.stats.IssuesCount
}

func (d *Discussion) LastCommentedAt() time.Time {
	return d.activity.LastCommentedAt
}

func (d *Discussion) ArchivedAt() *time.Time {
	return d.activity.ArchivedAt
}

func (d *Discussion) IsArchived() bool {
	return d.activity.ArchivedAt != nil
}

func (d *Discussion) CreatedBy() string {
	return d.activity.CreatedBy
}

func (d *Discussion) CreatedAt() time.Time {
	return d.activity.CreatedAt
}

func (d *Discussion) CanAddComment() error {
	if d.IsArchived() {
		return fmt.Errorf("discussion is archived: %w", apperr.ErrPermissionDenied)
	}
	if d.stats.CommentsCount >= MaxCommentsPerDiscussion {
		return fmt.Errorf("discussion has reached the limit of %d comments: %w", MaxCommentsPerDiscussion, apperr.ErrLimitExceeded)
	}
	return nil
}

func (d *Discussion) AddComment(now time.Time) {
	d.stats.CommentsCount++
	d.stats.ProposedCommentsCount++
	d.activity.LastCommentedAt = now
}

func (d *Discussion) AddCommentIssue() {
	d.stats.IssuesCount++
}

func (d *Discussion) ValidateComment(commentType string, parent *Comment) error {
	if err := d.CanAddComment(); err != nil {
		return err
	}
	var parentType *string
	if parent != nil {
		if parent.DiscussionID() != d.id {
			return apperr.ErrInvalidArgument
		}
		pt := parent.Type()
		parentType = &pt
	}
	return d.settings.CommentFrame.ValidateComment(commentType, parentType)
}

type DiscussionContent struct {
	Theme      string
	Premise    string
	Conclusion string
}

type DiscussionStats struct {
	CommentsCount         int
	ProposedCommentsCount int
	IssuesCount           int
}

type DiscussionActivity struct {
	CreatedBy       string
	CreatedAt       time.Time
	ArchivedAt      *time.Time
	LastCommentedAt time.Time
}

type DiscussionStatus string

const (
	DiscussionStatusPublic   DiscussionStatus = "public"
	DiscussionStatusInternal DiscussionStatus = "internal"
)

func (s DiscussionStatus) Validate() error {
	switch s {
	case DiscussionStatusPublic, DiscussionStatusInternal:
		return nil
	default:
		return apperr.ErrInvalidArgument
	}
}

func (s DiscussionStatus) IsPublic() bool {
	return s == DiscussionStatusPublic
}

func (s DiscussionStatus) IsInternal() bool {
	return s == DiscussionStatusInternal
}

type DiscussionSettings struct {
	CommentFrame      CommentFrame
	CommentPermission PermissionLevel
	IssuePermission   PermissionLevel
}

type CommentFrame struct {
	Types []string
	Paths []CommentPath
}

type CommentPath struct {
	Child  string
	Parent string
}

func (cf CommentFrame) ValidateComment(commentType string, parentType *string) error {
	if !slices.Contains(cf.Types, commentType) {
		return fmt.Errorf("invalid comment type: %s: %w", commentType, apperr.ErrInvalidArgument)
	}

	parent := ""
	if parentType != nil {
		parent = *parentType
	}

	pathAllowed := false
	for _, p := range cf.Paths {
		if p.Child == commentType && p.Parent == parent {
			pathAllowed = true
			break
		}
	}
	if !pathAllowed {
		return fmt.Errorf("invalid comment path: %s <- %s: %w", commentType, parent, apperr.ErrInvalidArgument)
	}
	return nil
}

type PermissionLevel string

const (
	PermissionEveryone      PermissionLevel = "everyone"
	PermissionAuthenticated PermissionLevel = "authenticated"
	PermissionNone          PermissionLevel = "none"
)

func (p PermissionLevel) Validate() error {
	switch p {
	case PermissionEveryone, PermissionAuthenticated, PermissionNone:
		return nil
	default:
		return fmt.Errorf("invalid permission level: %s: %w", p, apperr.ErrInvalidArgument)
	}
}

func (p PermissionLevel) CanPerform(userID string) bool {
	switch p {
	case PermissionEveryone:
		return true
	case PermissionAuthenticated:
		return userID != ""
	case PermissionNone:
		return false
	default:
		return false
	}
}

type DiscussionSort string

const (
	DiscussionSortLastCommentedAt DiscussionSort = "lastCommentedAt"
	DiscussionSortFavoritesCount  DiscussionSort = "favoritesCount"
)

func (s DiscussionSort) Validate() error {
	switch s {
	case DiscussionSortLastCommentedAt, DiscussionSortFavoritesCount:
		return nil
	default:
		return apperr.ErrInvalidArgument
	}
}
