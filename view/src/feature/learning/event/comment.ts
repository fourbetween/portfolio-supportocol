import type { Comment } from "../model/comment";

const LEARNING_COMMENT_SELECT_EVENT_NAME = "learning-comment-select";
const LEARNING_PROPOSED_COMMENT_ACCEPT_EVENT_NAME =
  "learning-proposed-comment-accept";
const LEARNING_PROPOSED_COMMENT_REJECT_EVENT_NAME =
  "learning-proposed-comment-reject";
const LEARNING_COMMENT_CREATE_EVENT_NAME = "learning-comment-create";
const LEARNING_COMMENT_CREATED_EVENT_NAME = "learning-comment-created";
const LEARNING_COMMENT_UPDATE_EVENT_NAME = "learning-comment-update";
const LEARNING_COMMENT_UPDATED_EVENT_NAME = "learning-comment-updated";
const LEARNING_COMMENT_DELETE_EVENT_NAME = "learning-comment-delete";
const LEARNING_COMMENT_DELETED_EVENT_NAME = "learning-comment-deleted";
const LEARNING_COMMENT_GENERATE_EVENT_NAME = "learning-comment-generate";
const LEARNING_COMMENT_GENERATED_EVENT_NAME = "learning-comment-generated";
const LEARNING_COMMENT_ARCHIVE_EVENT_NAME = "learning-comment-archive";
const LEARNING_COMMENT_UNARCHIVE_EVENT_NAME = "learning-comment-unarchive";
const LEARNING_COMMENT_FORM_CLOSE_EVENT_NAME = "learning-comment-form-close";
const LEARNING_COMMENT_TYPE_SELECT_EVENT_NAME = "learning-comment-type-select";

export class LearningCommentSelectEvent extends Event {
  public readonly commentId?: string;

  constructor(commentId?: string) {
    super(LEARNING_COMMENT_SELECT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

export class LearningProposedCommentAcceptEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(LEARNING_PROPOSED_COMMENT_ACCEPT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class LearningProposedCommentRejectEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(LEARNING_PROPOSED_COMMENT_REJECT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class LearningCommentCreateEvent extends Event {
  public readonly parentCommentId: string | null;
  public readonly commentType: string;
  public readonly content: string;

  constructor(
    parentCommentId: string | null,
    commentType: string,
    content: string,
  ) {
    super(LEARNING_COMMENT_CREATE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.parentCommentId = parentCommentId;
    this.commentType = commentType;
    this.content = content;
  }
}

export class LearningCommentCreatedEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(LEARNING_COMMENT_CREATED_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class LearningCommentUpdateEvent extends Event {
  public readonly commentId: string;
  public readonly commentType: string;
  public readonly content: string;

  constructor(commentId: string, commentType: string, content: string) {
    super(LEARNING_COMMENT_UPDATE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
    this.commentType = commentType;
    this.content = content;
  }
}

export class LearningCommentUpdatedEvent extends Event {
  public readonly comment: Comment;

  constructor(comment: Comment) {
    super(LEARNING_COMMENT_UPDATED_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.comment = comment;
  }
}

export class LearningCommentDeleteEvent extends Event {
  public readonly commentId: string;

  constructor(commentId: string) {
    super(LEARNING_COMMENT_DELETE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

export class LearningCommentDeletedEvent extends Event {
  public readonly commentId: string;

  constructor(commentId: string) {
    super(LEARNING_COMMENT_DELETED_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

export class LearningCommentGenerateEvent extends Event {
  public readonly parentCommentId?: string | null;
  public readonly commentType?: string;

  constructor(parentCommentId?: string | null, commentType?: string) {
    super(LEARNING_COMMENT_GENERATE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.parentCommentId = parentCommentId;
    this.commentType = commentType;
  }
}

export class LearningCommentGeneratedEvent extends Event {
  public readonly parentCommentId?: string | null;
  public readonly commentType?: string;

  constructor(parentCommentId?: string | null, commentType?: string) {
    super(LEARNING_COMMENT_GENERATED_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.parentCommentId = parentCommentId;
    this.commentType = commentType;
  }
}

export class LearningCommentFormCloseEvent extends Event {
  constructor() {
    super(LEARNING_COMMENT_FORM_CLOSE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
  }
}

export class LearningCommentTypeSelectEvent extends Event {
  public readonly commentType: string;

  constructor(commentType: string) {
    super(LEARNING_COMMENT_TYPE_SELECT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.commentType = commentType;
  }
}

export class LearningCommentArchiveEvent extends Event {
  public readonly commentId: string;

  constructor(commentId: string) {
    super(LEARNING_COMMENT_ARCHIVE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

export class LearningCommentUnarchiveEvent extends Event {
  public readonly commentId: string;

  constructor(commentId: string) {
    super(LEARNING_COMMENT_UNARCHIVE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.commentId = commentId;
  }
}

declare global {
  interface HTMLElementEventMap {
    [LEARNING_COMMENT_SELECT_EVENT_NAME]: LearningCommentSelectEvent;
    [LEARNING_PROPOSED_COMMENT_ACCEPT_EVENT_NAME]: LearningProposedCommentAcceptEvent;
    [LEARNING_PROPOSED_COMMENT_REJECT_EVENT_NAME]: LearningProposedCommentRejectEvent;
    [LEARNING_COMMENT_CREATE_EVENT_NAME]: LearningCommentCreateEvent;
    [LEARNING_COMMENT_CREATED_EVENT_NAME]: LearningCommentCreatedEvent;
    [LEARNING_COMMENT_UPDATE_EVENT_NAME]: LearningCommentUpdateEvent;
    [LEARNING_COMMENT_UPDATED_EVENT_NAME]: LearningCommentUpdatedEvent;
    [LEARNING_COMMENT_DELETE_EVENT_NAME]: LearningCommentDeleteEvent;
    [LEARNING_COMMENT_DELETED_EVENT_NAME]: LearningCommentDeletedEvent;
    [LEARNING_COMMENT_GENERATE_EVENT_NAME]: LearningCommentGenerateEvent;
    [LEARNING_COMMENT_GENERATED_EVENT_NAME]: LearningCommentGeneratedEvent;
    [LEARNING_COMMENT_ARCHIVE_EVENT_NAME]: LearningCommentArchiveEvent;
    [LEARNING_COMMENT_UNARCHIVE_EVENT_NAME]: LearningCommentUnarchiveEvent;
    [LEARNING_COMMENT_FORM_CLOSE_EVENT_NAME]: LearningCommentFormCloseEvent;
    [LEARNING_COMMENT_TYPE_SELECT_EVENT_NAME]: LearningCommentTypeSelectEvent;
  }
}
