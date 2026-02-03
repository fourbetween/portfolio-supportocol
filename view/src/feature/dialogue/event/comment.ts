import type { Comment } from "../model/comment";

const DIALOGUE_COMMENT_SELECT_EVENT_NAME = "dialogue-comment-select";
const DIALOGUE_COMMENT_CREATE_EVENT_NAME = "dialogue-comment-create";
const DIALOGUE_COMMENT_CREATE_CANCEL_EVENT_NAME =
  "dialogue-comment-create-cancel";
const DIALOGUE_COMMENT_CREATED_EVENT_NAME = "dialogue-comment-created";
const DIALOGUE_COMMENT_UPDATED_EVENT_NAME = "dialogue-comment-updated";
const DIALOGUE_COMMENT_ISSUE_REQUEST_EVENT_NAME =
  "dialogue-comment-issue-request";

export class DialogueCommentSelectEvent extends Event {
  public readonly commentId?: string;

  constructor(commentId?: string) {
    super(DIALOGUE_COMMENT_SELECT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

export class DialogueCommentCreateEvent extends Event {
  public readonly parentCommentId: string | null;
  public readonly commentType: string;
  public readonly content: string;

  constructor(
    parentCommentId: string | null,
    commentType: string,
    content: string,
  ) {
    super(DIALOGUE_COMMENT_CREATE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.parentCommentId = parentCommentId;
    this.commentType = commentType;
    this.content = content;
  }
}

export class DialogueCommentCreateCancelEvent extends Event {
  constructor() {
    super(DIALOGUE_COMMENT_CREATE_CANCEL_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
  }
}

export class DialogueCommentCreatedEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(DIALOGUE_COMMENT_CREATED_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class DialogueCommentUpdatedEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(DIALOGUE_COMMENT_UPDATED_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class DialogueCommentIssueRequestEvent extends Event {
  public readonly commentId: string;

  constructor(commentId: string) {
    super(DIALOGUE_COMMENT_ISSUE_REQUEST_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

declare global {
  interface HTMLElementEventMap {
    [DIALOGUE_COMMENT_SELECT_EVENT_NAME]: DialogueCommentSelectEvent;
    [DIALOGUE_COMMENT_CREATE_EVENT_NAME]: DialogueCommentCreateEvent;
    [DIALOGUE_COMMENT_CREATE_CANCEL_EVENT_NAME]: DialogueCommentCreateCancelEvent;
    [DIALOGUE_COMMENT_CREATED_EVENT_NAME]: DialogueCommentCreatedEvent;
    [DIALOGUE_COMMENT_UPDATED_EVENT_NAME]: DialogueCommentUpdatedEvent;
    [DIALOGUE_COMMENT_ISSUE_REQUEST_EVENT_NAME]: DialogueCommentIssueRequestEvent;
  }
}
