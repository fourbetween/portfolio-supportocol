import type { Discussion } from "../model/discussion";

const LEARNING_DISCUSSION_SELECT_EVENT_NAME = "learning-discussion-select";
const LEARNING_DISCUSSION_CREATE_EVENT_NAME = "learning-discussion-create";
const LEARNING_DISCUSSION_CREATED_EVENT_NAME = "learning-discussion-created";
const LEARNING_DISCUSSION_UPDATE_EVENT_NAME = "learning-discussion-update";
const LEARNING_DISCUSSION_UPDATED_EVENT_NAME = "learning-discussion-updated";
const LEARNING_DISCUSSION_DELETE_EVENT_NAME = "learning-discussion-delete";
const LEARNING_DISCUSSION_DELETED_EVENT_NAME = "learning-discussion-deleted";
const LEARNING_DISCUSSION_SEARCH_EVENT_NAME = "learning-discussion-search";
const LEARNING_DISCUSSION_FORM_OPEN_EVENT_NAME =
  "learning-discussion-form-open";
const LEARNING_DISCUSSION_FORM_CLOSE_EVENT_NAME =
  "learning-discussion-form-close";

export class LearningDiscussionSelectEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(LEARNING_DISCUSSION_SELECT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.discussion = discussion;
  }
}

export class LearningDiscussionCreateEvent extends Event {
  public readonly theme: string;
  public readonly status: Discussion["status"];

  constructor(theme: string, status: Discussion["status"]) {
    super(LEARNING_DISCUSSION_CREATE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.theme = theme;
    this.status = status;
  }
}

export class LearningDiscussionCreatedEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(LEARNING_DISCUSSION_CREATED_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.discussion = discussion;
  }
}

export class LearningDiscussionUpdateEvent extends Event {
  public readonly theme: string;

  constructor(theme: string) {
    super(LEARNING_DISCUSSION_UPDATE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.theme = theme;
  }
}

export class LearningDiscussionUpdatedEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(LEARNING_DISCUSSION_UPDATED_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.discussion = discussion;
  }
}

export class LearningDiscussionDeleteEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(LEARNING_DISCUSSION_DELETE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.discussion = discussion;
  }
}

export class LearningDiscussionDeletedEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(LEARNING_DISCUSSION_DELETED_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.discussion = discussion;
  }
}

export class LearningDiscussionSearchEvent extends Event {
  public readonly query: string;

  constructor(query: string) {
    super(LEARNING_DISCUSSION_SEARCH_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.query = query;
  }
}

export class LearningDiscussionFormOpenEvent extends Event {
  constructor() {
    super(LEARNING_DISCUSSION_FORM_OPEN_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
  }
}

export class LearningDiscussionFormCloseEvent extends Event {
  constructor() {
    super(LEARNING_DISCUSSION_FORM_CLOSE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
  }
}

declare global {
  interface HTMLElementEventMap {
    [LEARNING_DISCUSSION_SELECT_EVENT_NAME]: LearningDiscussionSelectEvent;
    [LEARNING_DISCUSSION_CREATE_EVENT_NAME]: LearningDiscussionCreateEvent;
    [LEARNING_DISCUSSION_CREATED_EVENT_NAME]: LearningDiscussionCreatedEvent;
    [LEARNING_DISCUSSION_UPDATE_EVENT_NAME]: LearningDiscussionUpdateEvent;
    [LEARNING_DISCUSSION_UPDATED_EVENT_NAME]: LearningDiscussionUpdatedEvent;
    [LEARNING_DISCUSSION_DELETE_EVENT_NAME]: LearningDiscussionDeleteEvent;
    [LEARNING_DISCUSSION_DELETED_EVENT_NAME]: LearningDiscussionDeletedEvent;
    [LEARNING_DISCUSSION_SEARCH_EVENT_NAME]: LearningDiscussionSearchEvent;
    [LEARNING_DISCUSSION_FORM_OPEN_EVENT_NAME]: LearningDiscussionFormOpenEvent;
    [LEARNING_DISCUSSION_FORM_CLOSE_EVENT_NAME]: LearningDiscussionFormCloseEvent;
  }
}
