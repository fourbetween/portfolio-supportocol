import type { Comment } from "../model/comment";

export class DialogueCommentSelectEvent extends Event {
  static get eventName() { return "dialogue-comment-select" as const; }
  public readonly commentId?: string;

  constructor(commentId?: string) {
    super(DialogueCommentSelectEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

export class DialogueCommentCreateEvent extends Event {
  static get eventName() { return "dialogue-comment-create" as const; }
  public readonly parentCommentId: string | null;
  public readonly commentType: string;
  public readonly content: string;

  constructor(
    parentCommentId: string | null,
    commentType: string,
    content: string,
  ) {
    super(DialogueCommentCreateEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.parentCommentId = parentCommentId;
    this.commentType = commentType;
    this.content = content;
  }
}

export class DialogueCommentCreateCancelEvent extends Event {
  static get eventName() { return "dialogue-comment-create-cancel" as const; }
  constructor() {
    super(DialogueCommentCreateCancelEvent.eventName, {
      bubbles: true,
      composed: true,
    });
  }
}

export class DialogueCommentCreatedEvent extends Event {
  static get eventName() { return "dialogue-comment-created" as const; }
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(DialogueCommentCreatedEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class DialogueCommentUpdatedEvent extends Event {
  static get eventName() { return "dialogue-comment-updated" as const; }
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(DialogueCommentUpdatedEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class DialogueCommentIssueRequestEvent extends Event {
  static get eventName() { return "dialogue-comment-issue-request" as const; }
  public readonly commentId: string;

  constructor(commentId: string) {
    super(DialogueCommentIssueRequestEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

declare global {
  interface HTMLElementEventMap {
    [DialogueCommentSelectEvent.eventName]: DialogueCommentSelectEvent;
    [DialogueCommentCreateEvent.eventName]: DialogueCommentCreateEvent;
    [DialogueCommentCreateCancelEvent.eventName]: DialogueCommentCreateCancelEvent;
    [DialogueCommentCreatedEvent.eventName]: DialogueCommentCreatedEvent;
    [DialogueCommentUpdatedEvent.eventName]: DialogueCommentUpdatedEvent;
    [DialogueCommentIssueRequestEvent.eventName]: DialogueCommentIssueRequestEvent;
  }
}
