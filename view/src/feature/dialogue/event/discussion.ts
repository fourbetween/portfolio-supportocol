const DIALOGUE_DISCUSSION_SELECT_EVENT_NAME = "dialogue-discussion-select";
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
    [DIALOGUE_FAVORITE_CREATE_EVENT_NAME]: DialogueFavoriteCreateEvent;
    [DIALOGUE_FAVORITE_DELETE_EVENT_NAME]: DialogueFavoriteDeleteEvent;
  }
}
