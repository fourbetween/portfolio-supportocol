import type { Comment } from "../model/comment";

export class LearningCommentSelectEvent extends Event {
  static get eventName() {
    return "learning-comment-select" as const;
  }
  public readonly commentId?: string;

  constructor(commentId?: string) {
    super(LearningCommentSelectEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

export class LearningProposedCommentAcceptEvent extends Event {
  static get eventName() {
    return "learning-proposed-comment-accept" as const;
  }
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(LearningProposedCommentAcceptEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class LearningProposedCommentRejectEvent extends Event {
  static get eventName() {
    return "learning-proposed-comment-reject" as const;
  }
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(LearningProposedCommentRejectEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class LearningCommentCreateEvent extends Event {
  static get eventName() {
    return "learning-comment-create" as const;
  }
  public readonly parentCommentId: string | null;
  public readonly commentType: string;
  public readonly content: string;

  constructor(
    parentCommentId: string | null,
    commentType: string,
    content: string,
  ) {
    super(LearningCommentCreateEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.parentCommentId = parentCommentId;
    this.commentType = commentType;
    this.content = content;
  }
}

export class LearningCommentCreatedEvent extends Event {
  static get eventName() {
    return "learning-comment-created" as const;
  }
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(LearningCommentCreatedEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class LearningCommentUpdateEvent extends Event {
  static get eventName() {
    return "learning-comment-update" as const;
  }
  public readonly commentId: string;
  public readonly commentType: string;
  public readonly content: string;

  constructor(commentId: string, commentType: string, content: string) {
    super(LearningCommentUpdateEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
    this.commentType = commentType;
    this.content = content;
  }
}

export class LearningCommentUpdatedEvent extends Event {
  static get eventName() {
    return "learning-comment-updated" as const;
  }
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(LearningCommentUpdatedEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class LearningCommentDeleteEvent extends Event {
  static get eventName() {
    return "learning-comment-delete" as const;
  }
  public readonly commentId: string;

  constructor(commentId: string) {
    super(LearningCommentDeleteEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

export class LearningCommentDeletedEvent extends Event {
  static get eventName() {
    return "learning-comment-deleted" as const;
  }
  public readonly commentId: string;

  constructor(commentId: string) {
    super(LearningCommentDeletedEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

export class LearningCommentGenerateEvent extends Event {
  static get eventName() {
    return "learning-comment-generate" as const;
  }
  public readonly parentCommentId?: string | null;
  public readonly commentType?: string;

  constructor(parentCommentId?: string | null, commentType?: string) {
    super(LearningCommentGenerateEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.parentCommentId = parentCommentId;
    this.commentType = commentType;
  }
}

export class LearningCommentGeneratedEvent extends Event {
  static get eventName() {
    return "learning-comment-generated" as const;
  }
  public readonly parentCommentId?: string | null;
  public readonly commentType?: string;
  public readonly comments: Comment[];

  constructor(
    parentCommentId?: string | null,
    commentType?: string,
    comments: Comment[] = [],
  ) {
    super(LearningCommentGeneratedEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.parentCommentId = parentCommentId;
    this.commentType = commentType;
    this.comments = comments;
  }
}

export class LearningCommentFormCloseEvent extends Event {
  static get eventName() {
    return "learning-comment-form-close" as const;
  }
  constructor() {
    super(LearningCommentFormCloseEvent.eventName, {
      bubbles: true,
      composed: true,
    });
  }
}

export class LearningCommentTypeSelectEvent extends Event {
  static get eventName() {
    return "learning-comment-type-select" as const;
  }
  public readonly commentType: string;

  constructor(commentType: string) {
    super(LearningCommentTypeSelectEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.commentType = commentType;
  }
}

export class LearningCommentArchiveEvent extends Event {
  static get eventName() {
    return "learning-comment-archive" as const;
  }
  public readonly commentId: string;

  constructor(commentId: string) {
    super(LearningCommentArchiveEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

export class LearningCommentUnarchiveEvent extends Event {
  static get eventName() {
    return "learning-comment-unarchive" as const;
  }
  public readonly commentId: string;

  constructor(commentId: string) {
    super(LearningCommentUnarchiveEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

export class LearningCommentCutEvent extends Event {
  static get eventName() {
    return "learning-comment-cut" as const;
  }
  public readonly commentId?: string;

  constructor(commentId?: string) {
    super(LearningCommentCutEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

export class LearningCommentMoveEvent extends Event {
  static get eventName() {
    return "learning-comment-move" as const;
  }
  public readonly commentId: string;
  public readonly parentCommentId: string | null;

  constructor(commentId: string, parentCommentId: string | null) {
    super(LearningCommentMoveEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
    this.parentCommentId = parentCommentId;
  }
}

export class LearningCommentLiftEvent extends Event {
  static get eventName() {
    return "learning-comment-lift" as const;
  }
  public readonly commentId: string;

  constructor(commentId: string) {
    super(LearningCommentLiftEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

declare global {
  interface HTMLElementEventMap {
    [LearningCommentSelectEvent.eventName]: LearningCommentSelectEvent;
    [LearningProposedCommentAcceptEvent.eventName]: LearningProposedCommentAcceptEvent;
    [LearningProposedCommentRejectEvent.eventName]: LearningProposedCommentRejectEvent;
    [LearningCommentCreateEvent.eventName]: LearningCommentCreateEvent;
    [LearningCommentCreatedEvent.eventName]: LearningCommentCreatedEvent;
    [LearningCommentUpdateEvent.eventName]: LearningCommentUpdateEvent;
    [LearningCommentUpdatedEvent.eventName]: LearningCommentUpdatedEvent;
    [LearningCommentDeleteEvent.eventName]: LearningCommentDeleteEvent;
    [LearningCommentDeletedEvent.eventName]: LearningCommentDeletedEvent;
    [LearningCommentGenerateEvent.eventName]: LearningCommentGenerateEvent;
    [LearningCommentGeneratedEvent.eventName]: LearningCommentGeneratedEvent;
    [LearningCommentArchiveEvent.eventName]: LearningCommentArchiveEvent;
    [LearningCommentUnarchiveEvent.eventName]: LearningCommentUnarchiveEvent;
    [LearningCommentCutEvent.eventName]: LearningCommentCutEvent;
    [LearningCommentMoveEvent.eventName]: LearningCommentMoveEvent;
    [LearningCommentLiftEvent.eventName]: LearningCommentLiftEvent;
    [LearningCommentFormCloseEvent.eventName]: LearningCommentFormCloseEvent;
    [LearningCommentTypeSelectEvent.eventName]: LearningCommentTypeSelectEvent;
  }
}
