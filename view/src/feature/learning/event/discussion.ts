import type { Discussion } from "../model/discussion";

const SELECT_DISCUSSION_EVENT_NAME = "select-discussion";
const CREATE_DISCUSSION_EVENT_NAME = "create-discussion";
const SEARCH_DISCUSSION_EVENT_NAME = "search-discussion";
const REQUEST_EDIT_DISCUSSION_EVENT_NAME = "request-edit-discussion";
const REQUEST_UPDATE_DISCUSSION_EVENT_NAME = "request-update-discussion";
const REQUEST_DELETE_DISCUSSION_EVENT_NAME = "request-delete-discussion";
const CANCEL_EDIT_DISCUSSION_EVENT_NAME = "cancel-edit-discussion";
const DISCUSSION_CREATED_EVENT_NAME = "discussion-created";
const DISCUSSION_UPDATED_EVENT_NAME = "discussion-updated";
const DISCUSSION_DELETED_EVENT_NAME = "discussion-deleted";

export class SelectDiscussionEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(SELECT_DISCUSSION_EVENT_NAME, { bubbles: true, composed: true });
    this.discussion = discussion;
  }
}

export class CreateDiscussionEvent extends Event {
  public readonly theme: string;

  constructor(theme: string) {
    super(CREATE_DISCUSSION_EVENT_NAME, { bubbles: true, composed: true });
    this.theme = theme;
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

export class RequestUpdateDiscussionEvent extends Event {
  public readonly theme: string;

  constructor(theme: string) {
    super(REQUEST_UPDATE_DISCUSSION_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.theme = theme;
  }
}

export class RequestDeleteDiscussionEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(REQUEST_DELETE_DISCUSSION_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.discussion = discussion;
  }
}

export class CancelEditDiscussionEvent extends Event {
  constructor() {
    super(CANCEL_EDIT_DISCUSSION_EVENT_NAME, { bubbles: true, composed: true });
  }
}

export class DiscussionCreatedEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(DISCUSSION_CREATED_EVENT_NAME, { bubbles: true, composed: true });
    this.discussion = discussion;
  }
}

export class DiscussionUpdatedEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(DISCUSSION_UPDATED_EVENT_NAME, { bubbles: true, composed: true });
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

declare global {
  interface HTMLElementEventMap {
    [SELECT_DISCUSSION_EVENT_NAME]: SelectDiscussionEvent;
    [CREATE_DISCUSSION_EVENT_NAME]: CreateDiscussionEvent;
    [SEARCH_DISCUSSION_EVENT_NAME]: SearchDiscussionEvent;
    [REQUEST_EDIT_DISCUSSION_EVENT_NAME]: RequestEditDiscussionEvent;
    [REQUEST_UPDATE_DISCUSSION_EVENT_NAME]: RequestUpdateDiscussionEvent;
    [REQUEST_DELETE_DISCUSSION_EVENT_NAME]: RequestDeleteDiscussionEvent;
    [CANCEL_EDIT_DISCUSSION_EVENT_NAME]: CancelEditDiscussionEvent;
    [DISCUSSION_CREATED_EVENT_NAME]: DiscussionCreatedEvent;
    [DISCUSSION_UPDATED_EVENT_NAME]: DiscussionUpdatedEvent;
    [DISCUSSION_DELETED_EVENT_NAME]: DiscussionDeletedEvent;
  }
}
