import type { DiscussionSort } from "../model/discussion";

export class DialogueDiscussionSelectEvent extends Event {
  static get eventName() { return "dialogue-discussion-select" as const; }
  public readonly workspaceId: string;
  public readonly discussionId: string;

  constructor(workspaceId: string, discussionId: string) {
    super(DialogueDiscussionSelectEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.workspaceId = workspaceId;
    this.discussionId = discussionId;
  }
}

export class DialogueDiscussionSortChangeEvent extends Event {
  static get eventName() { return "dialogue-discussion-sort-change" as const; }
  public readonly sort: DiscussionSort;

  constructor(sort: DiscussionSort) {
    super(DialogueDiscussionSortChangeEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.sort = sort;
  }
}

export class DialogueFavoriteCreateEvent extends Event {
  static get eventName() { return "dialogue-favorite-create" as const; }
  public readonly workspaceId: string;
  public readonly discussionId: string;

  constructor(workspaceId: string, discussionId: string) {
    super(DialogueFavoriteCreateEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.workspaceId = workspaceId;
    this.discussionId = discussionId;
  }
}

export class DialogueFavoriteDeleteEvent extends Event {
  static get eventName() { return "dialogue-favorite-delete" as const; }
  public readonly workspaceId: string;
  public readonly discussionId: string;

  constructor(workspaceId: string, discussionId: string) {
    super(DialogueFavoriteDeleteEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.workspaceId = workspaceId;
    this.discussionId = discussionId;
  }
}

declare global {
  interface HTMLElementEventMap {
    [DialogueDiscussionSelectEvent.eventName]: DialogueDiscussionSelectEvent;
    [DialogueDiscussionSortChangeEvent.eventName]: DialogueDiscussionSortChangeEvent;
    [DialogueFavoriteCreateEvent.eventName]: DialogueFavoriteCreateEvent;
    [DialogueFavoriteDeleteEvent.eventName]: DialogueFavoriteDeleteEvent;
  }
}
