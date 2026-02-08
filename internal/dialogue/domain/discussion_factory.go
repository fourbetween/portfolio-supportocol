package domain

type DiscussionFactory struct{}

func NewDiscussionFactory() *DiscussionFactory {
	return &DiscussionFactory{}
}

type ReconstructDiscussionParams struct {
	ID          string
	WorkspaceID string
	Content     DiscussionContent
	Status      DiscussionStatus
	Settings    DiscussionSettings
	Stats       DiscussionStats
	Activity    DiscussionActivity
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
