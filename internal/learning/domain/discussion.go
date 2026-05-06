package domain

import (
	"context"
	"fmt"
	"slices"
	"sort"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

const (
	MaxCommentsPerDiscussion = 200
	MaxDiscussionsPerProject = 50
)

type (
	DiscussionRepository interface {
		Load(ctx context.Context, params LoadDiscussionParams) (*Discussion, error)
		Save(ctx context.Context, discussion *Discussion) error
		Delete(ctx context.Context, discussion *Discussion) error
		CountByProjectID(ctx context.Context, workspaceID, projectID string) (int, error)
	}

	LoadDiscussionParams struct {
		ID          string
		WorkspaceID string
	}

	DiscussionCounts struct {
		CommentsCount         int
		ProposedCommentsCount int
		IssuesCount           int
	}
)

type DiscussionLanguage string

const (
	DiscussionLanguageEn DiscussionLanguage = "en"
	DiscussionLanguageJa DiscussionLanguage = "ja"
)

func (l DiscussionLanguage) Validate() error {
	switch l {
	case DiscussionLanguageEn, DiscussionLanguageJa:
		return nil
	default:
		return fmt.Errorf("invalid discussion language: %s: %w", l, apperr.ErrInvalidArgument)
	}
}

type (
	DiscussionFactory struct {
		idSrv    id.Service
		clockSrv clock.Service
	}

	CreateDiscussionParams struct {
		WorkspaceID string
		ProjectID   string
		Theme       string
		Premise     string
		Language    DiscussionLanguage
		CreatedBy   string
	}

	ReconstructDiscussionParams struct {
		ID               string
		WorkspaceID      string
		ProjectID        string
		Content          DiscussionContent
		Status           DiscussionStatus
		Stats            DiscussionStats
		Activity         DiscussionActivity
		DialogueSettings *DialogueSettings
	}
)

func NewDiscussionFactory(
	idSrv id.Service,
	clockSrv clock.Service,
) *DiscussionFactory {
	return &DiscussionFactory{
		idSrv:    idSrv,
		clockSrv: clockSrv,
	}
}

func (f *DiscussionFactory) Create(params CreateDiscussionParams, count int) (*Discussion, error) {
	if count >= MaxDiscussionsPerProject {
		return nil, apperr.ErrLimitExceeded
	}

	id := f.idSrv.Generate()
	now := f.clockSrv.Now()
	return f.Reconstruct(ReconstructDiscussionParams{
		ID:          id,
		WorkspaceID: params.WorkspaceID,
		ProjectID:   params.ProjectID,
		Content: DiscussionContent{
			Theme:    params.Theme,
			Premise:  params.Premise,
			Language: params.Language,
		},
		Status: DiscussionStatusPrivate,
		Activity: DiscussionActivity{
			CreatedBy:       params.CreatedBy,
			CreatedAt:       now,
			LastCommentedAt: now,
		},
	})
}

func (f *DiscussionFactory) Reconstruct(params ReconstructDiscussionParams) (*Discussion, error) {
	d := &Discussion{
		id:               params.ID,
		workspaceID:      params.WorkspaceID,
		projectID:        params.ProjectID,
		content:          params.Content,
		status:           params.Status,
		stats:            params.Stats,
		activity:         params.Activity,
		dialogueSettings: params.DialogueSettings,
	}

	if err := d.Validate(); err != nil {
		return nil, err
	}

	return d, nil
}

type Discussion struct {
	id               string
	workspaceID      string
	projectID        string
	content          DiscussionContent
	status           DiscussionStatus
	stats            DiscussionStats
	activity         DiscussionActivity
	dialogueSettings *DialogueSettings
}

func (d *Discussion) ID() string {
	return d.id
}

func (d *Discussion) WorkspaceID() string {
	return d.workspaceID
}

func (d *Discussion) ProjectID() string {
	return d.projectID
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

func (d *Discussion) Language() DiscussionLanguage {
	return d.content.Language
}

func (d *Discussion) Status() DiscussionStatus {
	return d.status
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

func (d *Discussion) CreatedBy() string {
	return d.activity.CreatedBy
}

func (d *Discussion) IsCreatedBy(userID string) bool {
	return d.activity.CreatedBy == userID
}

func (d *Discussion) CreatedAt() time.Time {
	return d.activity.CreatedAt
}

func (d *Discussion) DialogueSettings() (DialogueSettings, bool) {
	if d.dialogueSettings == nil {
		return DialogueSettings{}, false
	}
	return *d.dialogueSettings, true
}

func (d *Discussion) ArchivedAt() (time.Time, bool) {
	if d.activity.ArchivedAt.IsZero() {
		return time.Time{}, false
	}
	return d.activity.ArchivedAt, true
}

func (d *Discussion) IsArchived() bool {
	return !d.activity.ArchivedAt.IsZero()
}

func (d *Discussion) CanAddComment() error {
	if d.stats.CommentsCount >= MaxCommentsPerDiscussion {
		return fmt.Errorf(
			"discussion has reached the limit of %d comments: %w",
			MaxCommentsPerDiscussion,
			apperr.ErrLimitExceeded,
		)
	}
	return nil
}

func (d *Discussion) AddComment(now time.Time) {
	d.AddComments(1, now)
}

func (d *Discussion) AddComments(count int, now time.Time) {
	d.stats.CommentsCount += count
	d.activity.LastCommentedAt = now
}

func (d *Discussion) ResolveProposedComment(now time.Time) {
	if d.stats.ProposedCommentsCount > 0 {
		d.stats.ProposedCommentsCount--
		d.activity.LastCommentedAt = now
	}
}

func (d *Discussion) AddCommentIssue() {
	d.stats.IssuesCount++
}

func (d *Discussion) RemoveCommentIssue() {
	if d.stats.IssuesCount > 0 {
		d.stats.IssuesCount--
	}
}

func (d *Discussion) SyncCommentsCount(count int) {
	d.stats.CommentsCount = count
}

func (d *Discussion) SyncCounts(counts DiscussionCounts) {
	d.stats.CommentsCount = counts.CommentsCount
	d.stats.ProposedCommentsCount = counts.ProposedCommentsCount
	d.stats.IssuesCount = counts.IssuesCount
}

type UpdateParams struct {
	Theme      string
	Premise    string
	Conclusion string
	Language   DiscussionLanguage
}

func (d *Discussion) Update(params UpdateParams) error {
	if err := params.Language.Validate(); err != nil {
		return err
	}
	d.content.Theme = params.Theme
	d.content.Premise = params.Premise
	d.content.Conclusion = params.Conclusion
	d.content.Language = params.Language
	return nil
}

type UpdateStatusParams struct {
	Status            DiscussionStatus
	CommentFrame      *CommentFrame
	CommentPermission PermissionLevel
	IssuePermission   PermissionLevel
}

func (d *Discussion) UpdateStatus(params UpdateStatusParams) error {
	if err := params.Status.Validate(); err != nil {
		return fmt.Errorf("invalid discussion status: %s: %w", params.Status, err)
	}

	if params.Status.RequiresDialogueSettings() {
		if params.CommentFrame == nil {
			return fmt.Errorf("comment frame is required for %s status: %w", params.Status, apperr.ErrInvalidArgument)
		}
		d.dialogueSettings = &DialogueSettings{
			CommentFrame:      params.CommentFrame.Sorted(),
			CommentPermission: params.CommentPermission,
			IssuePermission:   params.IssuePermission,
		}
	} else {
		d.dialogueSettings = nil
	}

	d.status = params.Status
	return d.Validate()
}

func (d *Discussion) Validate() error {
	if err := d.content.Language.Validate(); err != nil {
		return err
	}
	if err := d.status.Validate(); err != nil {
		return err
	}
	if d.status.RequiresDialogueSettings() {
		if d.dialogueSettings == nil {
			return fmt.Errorf("dialogue settings is required for %s status: %w", d.status, apperr.ErrInvalidArgument)
		}
		if err := d.dialogueSettings.Validate(); err != nil {
			return err
		}
	}
	if d.status.IsPrivate() && d.dialogueSettings != nil {
		return fmt.Errorf("dialogue settings must be nil for private status: %w", apperr.ErrInvalidArgument)
	}
	return nil
}

func (d *Discussion) Archive(now time.Time) error {
	if d.IsArchived() {
		return fmt.Errorf("discussion is already archived: %w", apperr.ErrInvalidArgument)
	}
	d.activity.ArchivedAt = now
	return nil
}

func (d *Discussion) Unarchive() error {
	if !d.IsArchived() {
		return fmt.Errorf("discussion is not archived: %w", apperr.ErrInvalidArgument)
	}
	d.activity.ArchivedAt = time.Time{}
	return nil
}

func (d *Discussion) CanReplaceComments(count int) error {
	if count > MaxCommentsPerDiscussion {
		return fmt.Errorf(
			"comments count %d exceeds the limit of %d: %w",
			count,
			MaxCommentsPerDiscussion,
			apperr.ErrLimitExceeded,
		)
	}
	return nil
}

func (d *Discussion) ReplaceComments(newComments []*Comment, now time.Time) {
	proposedCount := 0
	issuesCount := 0
	for _, c := range newComments {
		if c.Status() == CommentStatusProposed {
			proposedCount++
		}
		issuesCount += len(c.Issues())
	}

	d.stats = DiscussionStats{
		CommentsCount:         len(newComments),
		ProposedCommentsCount: proposedCount,
		IssuesCount:           issuesCount,
	}

	if len(newComments) > 0 {
		d.activity.LastCommentedAt = now
	}

	if d.dialogueSettings != nil {
		d.dialogueSettings.CommentFrame = d.dialogueSettings.CommentFrame.Supplement(newComments)
	}
}

func (d *Discussion) EnsureCommentFrameRequirement(commentType string, parentType string) {
	if !d.status.RequiresDialogueSettings() || d.dialogueSettings == nil {
		return
	}

	d.dialogueSettings.CommentFrame = d.dialogueSettings.CommentFrame.Add(commentType, parentType)
}

func (d *Discussion) RenameCommentType(oldType, newType string) error {
	if oldType == newType {
		return nil
	}

	if d.dialogueSettings != nil {
		renamed, err := d.dialogueSettings.CommentFrame.RenameType(oldType, newType)
		if err != nil {
			return err
		}
		d.dialogueSettings.CommentFrame = renamed
	}

	return nil
}

type DiscussionContent struct {
	Theme      string
	Premise    string
	Conclusion string
	Language   DiscussionLanguage
}

type DiscussionStats struct {
	CommentsCount         int
	ProposedCommentsCount int
	IssuesCount           int
}

type DiscussionActivity struct {
	CreatedBy       string
	CreatedAt       time.Time
	ArchivedAt      time.Time
	LastCommentedAt time.Time
}

type DiscussionStatus string

const (
	DiscussionStatusPrivate  DiscussionStatus = "private"
	DiscussionStatusPublic   DiscussionStatus = "public"
	DiscussionStatusInternal DiscussionStatus = "internal"
)

func (s DiscussionStatus) Validate() error {
	switch s {
	case DiscussionStatusPrivate, DiscussionStatusPublic, DiscussionStatusInternal:
		return nil
	default:
		return apperr.ErrInvalidArgument
	}
}

func (s DiscussionStatus) IsPrivate() bool {
	return s == DiscussionStatusPrivate
}

func (s DiscussionStatus) IsPublic() bool {
	return s == DiscussionStatusPublic
}

func (s DiscussionStatus) IsInternal() bool {
	return s == DiscussionStatusInternal
}

func (s DiscussionStatus) RequiresDialogueSettings() bool {
	return s.IsPublic() || s.IsInternal()
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

type DialogueSettings struct {
	CommentFrame      CommentFrame
	CommentPermission PermissionLevel
	IssuePermission   PermissionLevel
}

func (s DialogueSettings) Validate() error {
	if err := s.CommentFrame.Validate(); err != nil {
		return err
	}
	if err := s.CommentPermission.Validate(); err != nil {
		return err
	}
	if err := s.IssuePermission.Validate(); err != nil {
		return err
	}
	return nil
}

type (
	CommentFrame struct {
		Types []string
		Paths []CommentPath
	}

	CommentPath struct {
		Child  string
		Parent string
	}
)

func (cf CommentFrame) Sorted() CommentFrame {
	sortedTypes := append([]string{}, cf.Types...)
	sort.Strings(sortedTypes)

	sortedPaths := append([]CommentPath{}, cf.Paths...)
	sort.Slice(sortedPaths, func(i, j int) bool {
		if sortedPaths[i].Parent != sortedPaths[j].Parent {
			return sortedPaths[i].Parent < sortedPaths[j].Parent
		}
		return sortedPaths[i].Child < sortedPaths[j].Child
	})

	return CommentFrame{
		Types: sortedTypes,
		Paths: sortedPaths,
	}
}

func (cf CommentFrame) Add(child, parent string) CommentFrame {
	newCF := cf
	typeExists := slices.Contains(newCF.Types, child)
	if !typeExists {
		newCF.Types = append(newCF.Types, child)
	}

	pathExists := false
	for _, p := range newCF.Paths {
		if p.Child == child && p.Parent == parent {
			pathExists = true
			break
		}
	}

	if !pathExists {
		newCF.Paths = append(newCF.Paths, CommentPath{
			Child:  child,
			Parent: parent,
		})
	}

	if !typeExists || !pathExists {
		return newCF.Sorted()
	}
	return cf
}

func (cf CommentFrame) RenameType(oldType, newType string) (CommentFrame, error) {
	if oldType == newType {
		return cf, nil
	}

	if !slices.Contains(cf.Types, oldType) {
		return cf, fmt.Errorf("comment type %q not found in frame: %w", oldType, apperr.ErrNotFound)
	}
	if slices.Contains(cf.Types, newType) {
		return cf, fmt.Errorf("comment type %q already exists in frame: %w", newType, apperr.ErrAlreadyExists)
	}

	newTypes := make([]string, len(cf.Types))
	for i, t := range cf.Types {
		if t == oldType {
			newTypes[i] = newType
		} else {
			newTypes[i] = t
		}
	}

	newPaths := make([]CommentPath, len(cf.Paths))
	for i, p := range cf.Paths {
		child := p.Child
		parent := p.Parent
		if child == oldType {
			child = newType
		}
		if parent == oldType {
			parent = newType
		}
		newPaths[i] = CommentPath{Child: child, Parent: parent}
	}

	renamed := CommentFrame{Types: newTypes, Paths: newPaths}
	return renamed.Sorted(), nil
}

func (cf CommentFrame) Validate() error {
	if len(cf.Types) == 0 {
		return fmt.Errorf("comment frame types must not be empty: %w", apperr.ErrInvalidArgument)
	}

	typeMap := make(map[string]struct{}, len(cf.Types))
	for _, t := range cf.Types {
		if _, ok := typeMap[t]; ok {
			return fmt.Errorf("comment frame type %q is duplicated: %w", t, apperr.ErrInvalidArgument)
		}
		typeMap[t] = struct{}{}
	}

	for _, p := range cf.Paths {
		if _, ok := typeMap[p.Child]; !ok {
			return fmt.Errorf("comment path child %q is not in types: %w", p.Child, apperr.ErrInvalidArgument)
		}
		if p.Parent != "" {
			if _, ok := typeMap[p.Parent]; !ok {
				return fmt.Errorf("comment path parent %q is not in types: %w", p.Parent, apperr.ErrInvalidArgument)
			}
		}
	}
	return nil
}

func (cf CommentFrame) Supplement(comments []*Comment) CommentFrame {
	newCF := CommentFrame{
		Types: append([]string{}, cf.Types...),
		Paths: append([]CommentPath{}, cf.Paths...),
	}

	typeMap := make(map[string]struct{}, len(newCF.Types))
	for _, t := range newCF.Types {
		typeMap[t] = struct{}{}
	}

	pathMap := make(map[CommentPath]struct{}, len(newCF.Paths))
	for _, p := range newCF.Paths {
		pathMap[p] = struct{}{}
	}

	commentMap := make(map[string]*Comment, len(comments))
	for _, c := range comments {
		commentMap[c.ID()] = c
	}

	for _, c := range comments {
		if _, ok := typeMap[c.Type()]; !ok {
			newCF.Types = append(newCF.Types, c.Type())
			typeMap[c.Type()] = struct{}{}
		}

		var parentType string
		if parentID, ok := c.ParentCommentID(); ok {
			if parent, ok := commentMap[parentID]; ok {
				parentType = parent.Type()
			}
		}

		path := CommentPath{
			Child:  c.Type(),
			Parent: parentType,
		}
		if _, ok := pathMap[path]; !ok {
			newCF.Paths = append(newCF.Paths, path)
			pathMap[path] = struct{}{}
		}
	}

	return newCF.Sorted()
}
