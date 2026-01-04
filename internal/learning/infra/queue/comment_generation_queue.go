package queue

import (
	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/pkg-queue/sqs"
)

type CommentGenerationQueue struct {
	q sqs.Queue[domain.GenerateCommentParams]
}

func NewCommentGenerationQueue(q sqs.Queue[domain.GenerateCommentParams]) *CommentGenerationQueue {
	return &CommentGenerationQueue{q: q}
}

func (cgq *CommentGenerationQueue) Enqueue(params []domain.GenerateCommentParams) error {
	in := make([]*domain.GenerateCommentParams, len(params))
	for i := range params {
		in[i] = &params[i]
	}
	return cgq.q.Enqueue(in)
}
