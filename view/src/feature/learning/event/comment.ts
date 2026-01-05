import type { Comment } from "../model/comment";

export const SELECT_COMMENT_EVENT_NAME = "select-comment";
export const COMMENT_CREATED_EVENT_NAME = "comment-created";
export const COMMENT_UPDATED_EVENT_NAME = "comment-updated";
export const COMMENT_DELETED_EVENT_NAME = "comment-deleted";
export const COMMENT_GENERATED_EVENT_NAME = "comment-generated";

export class SelectCommentEvent extends Event {
  public readonly commentId?: string;

  constructor(commentId?: string) {
    super(SELECT_COMMENT_EVENT_NAME, { bubbles: true, composed: true });
    this.commentId = commentId;
  }
}

export class CommentCreatedEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(COMMENT_CREATED_EVENT_NAME, { bubbles: true, composed: true });
    this.comment = comment;
  }
}

export class CommentUpdatedEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(COMMENT_UPDATED_EVENT_NAME, { bubbles: true, composed: true });
    this.comment = comment;
  }
}

export class CommentDeletedEvent extends Event {
  public readonly commentId: string;

  constructor(commentId: string) {
    super(COMMENT_DELETED_EVENT_NAME, { bubbles: true, composed: true });
    this.commentId = commentId;
  }
}

export class CommentGeneratedEvent extends Event {
  public readonly parentCommentId?: string | null;
  public readonly commentType?: string;

  constructor(parentCommentId?: string | null, commentType?: string) {
    super(COMMENT_GENERATED_EVENT_NAME, { bubbles: true, composed: true });
    this.parentCommentId = parentCommentId;
    this.commentType = commentType;
  }
}

declare global {
  interface HTMLElementEventMap {
    [SELECT_COMMENT_EVENT_NAME]: SelectCommentEvent;
    [COMMENT_CREATED_EVENT_NAME]: CommentCreatedEvent;
    [COMMENT_UPDATED_EVENT_NAME]: CommentUpdatedEvent;
    [COMMENT_DELETED_EVENT_NAME]: CommentDeletedEvent;
    [COMMENT_GENERATED_EVENT_NAME]: CommentGeneratedEvent;
  }
}
