import type { Comment } from "../model/comment";

const COMMENT_SELECT_EVENT_NAME = "comment-select";
const PROPOSED_COMMENT_ACCEPT_EVENT_NAME = "proposed-comment-accept";
const REJECT_PROPOSED_COMMENT_EVENT_NAME = "reject-proposed-comment";
const SELECT_PROPOSED_COMMENT_EVENT_NAME = "select-proposed-comment";
const COMMENT_CREATED_EVENT_NAME = "comment-created";
const COMMENT_UPDATED_EVENT_NAME = "comment-updated";
const COMMENT_DELETED_EVENT_NAME = "comment-deleted";
const COMMENT_GENERATED_EVENT_NAME = "comment-generated";
const REQUEST_COMMENT_UPDATE_EVENT_NAME = "request-comment-update";
const REQUEST_COMMENT_REPLY_EVENT_NAME = "request-comment-reply";
const COMMENT_SAVE_EVENT_NAME = "comment-save";
const COMMENT_CANCEL_EVENT_NAME = "comment-cancel";
const COMMENT_TYPE_SELECT_EVENT_NAME = "comment-type-select";

export class CommentSelectEvent extends Event {
  public readonly commentId?: string;

  constructor(commentId?: string) {
    super(COMMENT_SELECT_EVENT_NAME, { bubbles: true, composed: true });
    this.commentId = commentId;
  }
}

export class ProposedCommentAcceptEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(PROPOSED_COMMENT_ACCEPT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class RejectProposedCommentEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(REJECT_PROPOSED_COMMENT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class SelectProposedCommentEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(SELECT_PROPOSED_COMMENT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
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

export class RequestCommentUpdateEvent extends Event {
  public readonly commentId: string;
  public readonly commentType: string;
  public readonly content: string;

  constructor(commentId: string, commentType: string, content: string) {
    super(REQUEST_COMMENT_UPDATE_EVENT_NAME, { bubbles: true, composed: true });
    this.commentId = commentId;
    this.commentType = commentType;
    this.content = content;
  }
}

export class RequestCommentReplyEvent extends Event {
  public readonly parentCommentId: string;
  public readonly commentType: string;
  public readonly content: string;

  constructor(parentCommentId: string, commentType: string, content: string) {
    super(REQUEST_COMMENT_REPLY_EVENT_NAME, { bubbles: true, composed: true });
    this.parentCommentId = parentCommentId;
    this.commentType = commentType;
    this.content = content;
  }
}

export class CommentSaveEvent extends Event {
  public readonly commentType: string;
  public readonly content: string;

  constructor(commentType: string, content: string) {
    super(COMMENT_SAVE_EVENT_NAME, { bubbles: true, composed: true });
    this.commentType = commentType;
    this.content = content;
  }
}

export class CommentCancelEvent extends Event {
  constructor() {
    super(COMMENT_CANCEL_EVENT_NAME, { bubbles: true, composed: true });
  }
}

export class CommentTypeSelectEvent extends Event {
  public readonly commentType: string;

  constructor(commentType: string) {
    super(COMMENT_TYPE_SELECT_EVENT_NAME, { bubbles: true, composed: true });
    this.commentType = commentType;
  }
}

declare global {
  interface HTMLElementEventMap {
    [COMMENT_SELECT_EVENT_NAME]: CommentSelectEvent;
    [PROPOSED_COMMENT_ACCEPT_EVENT_NAME]: ProposedCommentAcceptEvent;
    [REJECT_PROPOSED_COMMENT_EVENT_NAME]: RejectProposedCommentEvent;
    [SELECT_PROPOSED_COMMENT_EVENT_NAME]: SelectProposedCommentEvent;
    [COMMENT_CREATED_EVENT_NAME]: CommentCreatedEvent;
    [COMMENT_UPDATED_EVENT_NAME]: CommentUpdatedEvent;
    [COMMENT_DELETED_EVENT_NAME]: CommentDeletedEvent;
    [COMMENT_GENERATED_EVENT_NAME]: CommentGeneratedEvent;
    [REQUEST_COMMENT_UPDATE_EVENT_NAME]: RequestCommentUpdateEvent;
    [REQUEST_COMMENT_REPLY_EVENT_NAME]: RequestCommentReplyEvent;
    [COMMENT_SAVE_EVENT_NAME]: CommentSaveEvent;
    [COMMENT_CANCEL_EVENT_NAME]: CommentCancelEvent;
    [COMMENT_TYPE_SELECT_EVENT_NAME]: CommentTypeSelectEvent;
  }
}
