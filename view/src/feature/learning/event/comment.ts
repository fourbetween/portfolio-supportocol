import type { Comment } from "../model/comment";

const COMMENT_SELECT_EVENT_NAME = "comment-select";
const PROPOSED_COMMENT_ACCEPT_EVENT_NAME = "proposed-comment-accept";
const PROPOSED_COMMENT_REJECT_EVENT_NAME = "proposed-comment-reject";
const PROPOSED_COMMENT_SELECT_EVENT_NAME = "proposed-comment-select";
const COMMENT_CREATE_EVENT_NAME = "comment-create";
const COMMENT_CREATED_EVENT_NAME = "comment-created";
const COMMENT_UPDATE_EVENT_NAME = "comment-update";
const COMMENT_UPDATED_EVENT_NAME = "comment-updated";
const COMMENT_DELETE_EVENT_NAME = "comment-delete";
const COMMENT_DELETED_EVENT_NAME = "comment-deleted";
const COMMENT_GENERATE_EVENT_NAME = "comment-generate";
const COMMENT_GENERATED_EVENT_NAME = "comment-generated";
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

export class ProposedCommentRejectEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(PROPOSED_COMMENT_REJECT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class ProposedCommentSelectEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(PROPOSED_COMMENT_SELECT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class CommentCreateEvent extends Event {
  public readonly parentCommentId: string | null;
  public readonly commentType: string;
  public readonly content: string;

  constructor(
    parentCommentId: string | null,
    commentType: string,
    content: string
  ) {
    super(COMMENT_CREATE_EVENT_NAME, { bubbles: true, composed: true });
    this.parentCommentId = parentCommentId;
    this.commentType = commentType;
    this.content = content;
  }
}

export class CommentCreatedEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(COMMENT_CREATED_EVENT_NAME, { bubbles: true, composed: true });
    this.comment = comment;
  }
}

export class CommentUpdateEvent extends Event {
  public readonly commentId: string;
  public readonly commentType: string;
  public readonly content: string;

  constructor(commentId: string, commentType: string, content: string) {
    super(COMMENT_UPDATE_EVENT_NAME, { bubbles: true, composed: true });
    this.commentId = commentId;
    this.commentType = commentType;
    this.content = content;
  }
}

export class CommentUpdatedEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(COMMENT_UPDATED_EVENT_NAME, { bubbles: true, composed: true });
    this.comment = comment;
  }
}

export class CommentDeleteEvent extends Event {
  public readonly commentId: string;

  constructor(commentId: string) {
    super(COMMENT_DELETE_EVENT_NAME, { bubbles: true, composed: true });
    this.commentId = commentId;
  }
}

export class CommentDeletedEvent extends Event {
  public readonly commentId: string;

  constructor(commentId: string) {
    super(COMMENT_DELETED_EVENT_NAME, { bubbles: true, composed: true });
    this.commentId = commentId;
  }
}

export class CommentGenerateEvent extends Event {
  public readonly parentCommentId?: string | null;
  public readonly commentType?: string;

  constructor(parentCommentId?: string | null, commentType?: string) {
    super(COMMENT_GENERATE_EVENT_NAME, { bubbles: true, composed: true });
    this.parentCommentId = parentCommentId;
    this.commentType = commentType;
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
    [PROPOSED_COMMENT_REJECT_EVENT_NAME]: ProposedCommentRejectEvent;
    [PROPOSED_COMMENT_SELECT_EVENT_NAME]: ProposedCommentSelectEvent;
    [COMMENT_CREATE_EVENT_NAME]: CommentCreateEvent;
    [COMMENT_CREATED_EVENT_NAME]: CommentCreatedEvent;
    [COMMENT_UPDATE_EVENT_NAME]: CommentUpdateEvent;
    [COMMENT_UPDATED_EVENT_NAME]: CommentUpdatedEvent;
    [COMMENT_DELETE_EVENT_NAME]: CommentDeleteEvent;
    [COMMENT_DELETED_EVENT_NAME]: CommentDeletedEvent;
    [COMMENT_GENERATE_EVENT_NAME]: CommentGenerateEvent;
    [COMMENT_GENERATED_EVENT_NAME]: CommentGeneratedEvent;
    [COMMENT_CANCEL_EVENT_NAME]: CommentCancelEvent;
    [COMMENT_TYPE_SELECT_EVENT_NAME]: CommentTypeSelectEvent;
  }
}
