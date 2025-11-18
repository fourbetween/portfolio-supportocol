package discussion_test

import (
	"testing"

	"github.com/fourbetween/app-supportocol/internal/model/discussion"
	"github.com/fourbetween/app-supportocol/internal/service/id"
	"go.uber.org/mock/gomock"
)

type (
	container struct {
		DiscussionFac  *discussion.Factory
		DiscussionRepo discussion.Repository
	}
)

func newContainer(t *testing.T) *container {
	ctrl := gomock.NewController(t)

	idSrv := id.NewULIDService()
	discussionRepo := discussion.NewMockRepository(ctrl)
	discussionFac := discussion.NewFactory(
		discussionRepo,
		idSrv,
	)
	return &container{
		DiscussionFac:  discussionFac,
		DiscussionRepo: discussionRepo,
	}
}
