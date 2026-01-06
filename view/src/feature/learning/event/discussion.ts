import type { Discussion } from "../model/discussion";

const DISCUSSION_SELECT_EVENT_NAME = "discussion-select";
const DISCUSSION_CREATE_EVENT_NAME = "discussion-create";
const DISCUSSION_CREATED_EVENT_NAME = "discussion-created";
const DISCUSSION_UPDATE_EVENT_NAME = "discussion-update";
const DISCUSSION_UPDATED_EVENT_NAME = "discussion-updated";
const DISCUSSION_DELETE_EVENT_NAME = "discussion-delete";
const DISCUSSION_DELETED_EVENT_NAME = "discussion-deleted";
const SEARCH_DISCUSSION_EVENT_NAME = "search-discussion";
const REQUEST_EDIT_DISCUSSION_EVENT_NAME = "request-edit-discussion";
const CANCEL_EDIT_DISCUSSION_EVENT_NAME = "cancel-edit-discussion";

export class SelectDiscussionEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(DISCUSSION_SELECT_EVENT_NAME, { bubbles: true, composed: true });
    this.discussion = discussion;
  }
}

export class CreateDiscussionEvent extends Event {
  public readonly theme: string;

  constructor(theme: string) {
    super(DISCUSSION_CREATE_EVENT_NAME, { bubbles: true, composed: true });
    this.theme = theme;
  }
}

export class DiscussionCreatedEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(DISCUSSION_CREATED_EVENT_NAME, { bubbles: true, composed: true });
    this.discussion = discussion;
  }
}

export class RequestUpdateDiscussionEvent extends Event {
  public readonly theme: string;

  constructor(theme: string) {
    super(DISCUSSION_UPDATE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.theme = theme;
  }
}

export class DiscussionUpdatedEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(DISCUSSION_UPDATED_EVENT_NAME, { bubbles: true, composed: true });
    this.discussion = discussion;
  }
}

export class RequestDeleteDiscussionEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(DISCUSSION_DELETE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.discussion = discussion;
  }
}

export class DiscussionDeletedEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(DISCUSSION_DELETED_EVENT_NAME, { bubbles: true, composed: true });
    this.discussion = discussion;
  }
}

export class SearchDiscussionEvent extends Event {
  public readonly query: string;

  constructor(query: string) {
    super(SEARCH_DISCUSSION_EVENT_NAME, { bubbles: true, composed: true });
    this.query = query;
  }
}

export class RequestEditDiscussionEvent extends Event {
  constructor() {
    super(REQUEST_EDIT_DISCUSSION_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
  }
}

export class CancelEditDiscussionEvent extends Event {
  constructor() {
    super(CANCEL_EDIT_DISCUSSION_EVENT_NAME, { bubbles: true, composed: true });
  }
}

declare global {
  interface HTMLElementEventMap {
    [DISCUSSION_SELECT_EVENT_NAME]: SelectDiscussionEvent;
    [DISCUSSION_CREATE_EVENT_NAME]: CreateDiscussionEvent;
    [DISCUSSION_CREATED_EVENT_NAME]: DiscussionCreatedEvent;
    [DISCUSSION_UPDATE_EVENT_NAME]: RequestUpdateDiscussionEvent;
    [DISCUSSION_UPDATED_EVENT_NAME]: DiscussionUpdatedEvent;
    [DISCUSSION_DELETE_EVENT_NAME]: RequestDeleteDiscussionEvent;
    [DISCUSSION_DELETED_EVENT_NAME]: DiscussionDeletedEvent;
    [SEARCH_DISCUSSION_EVENT_NAME]: SearchDiscussionEvent;
    [REQUEST_EDIT_DISCUSSION_EVENT_NAME]: RequestEditDiscussionEvent;
    [CANCEL_EDIT_DISCUSSION_EVENT_NAME]: CancelEditDiscussionEvent;
  }
}
