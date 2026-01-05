import type { Discussion } from "../model/discussion";

export const SELECT_DISCUSSION_EVENT_NAME = "select-discussion";
export const DISCUSSION_CREATED_EVENT_NAME = "discussion-created";
export const DISCUSSION_UPDATED_EVENT_NAME = "discussion-updated";
export const DISCUSSION_DELETED_EVENT_NAME = "discussion-deleted";

export class SelectDiscussionEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(SELECT_DISCUSSION_EVENT_NAME, { bubbles: true, composed: true });
    this.discussion = discussion;
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
    [DISCUSSION_CREATED_EVENT_NAME]: DiscussionCreatedEvent;
    [DISCUSSION_UPDATED_EVENT_NAME]: DiscussionUpdatedEvent;
    [DISCUSSION_DELETED_EVENT_NAME]: DiscussionDeletedEvent;
  }
}
