import type { DiscussionSort } from "../model/discussion";

const DIALOGUE_DISCUSSION_SELECT_EVENT_NAME = "dialogue-discussion-select";
const DIALOGUE_DISCUSSION_SORT_CHANGE_EVENT_NAME =
  "dialogue-discussion-sort-change";
const DIALOGUE_FAVORITE_CREATE_EVENT_NAME = "dialogue-favorite-create";
const DIALOGUE_FAVORITE_DELETE_EVENT_NAME = "dialogue-favorite-delete";

export class DialogueDiscussionSelectEvent extends Event {
  public readonly workspaceId: string;
  public readonly discussionId: string;

  constructor(workspaceId: string, discussionId: string) {
    super(DIALOGUE_DISCUSSION_SELECT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.workspaceId = workspaceId;
    this.discussionId = discussionId;
  }
}

export class DialogueDiscussionSortChangeEvent extends Event {
  public readonly sort: DiscussionSort;

  constructor(sort: DiscussionSort) {
    super(DIALOGUE_DISCUSSION_SORT_CHANGE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.sort = sort;
  }
}

export class DialogueFavoriteCreateEvent extends Event {
  public readonly workspaceId: string;
  public readonly discussionId: string;

  constructor(workspaceId: string, discussionId: string) {
    super(DIALOGUE_FAVORITE_CREATE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.workspaceId = workspaceId;
    this.discussionId = discussionId;
  }
}

export class DialogueFavoriteDeleteEvent extends Event {
  public readonly workspaceId: string;
  public readonly discussionId: string;

  constructor(workspaceId: string, discussionId: string) {
    super(DIALOGUE_FAVORITE_DELETE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.workspaceId = workspaceId;
    this.discussionId = discussionId;
  }
}

declare global {
  interface HTMLElementEventMap {
    [DIALOGUE_DISCUSSION_SELECT_EVENT_NAME]: DialogueDiscussionSelectEvent;
    [DIALOGUE_DISCUSSION_SORT_CHANGE_EVENT_NAME]: DialogueDiscussionSortChangeEvent;
    [DIALOGUE_FAVORITE_CREATE_EVENT_NAME]: DialogueFavoriteCreateEvent;
    [DIALOGUE_FAVORITE_DELETE_EVENT_NAME]: DialogueFavoriteDeleteEvent;
  }
}
