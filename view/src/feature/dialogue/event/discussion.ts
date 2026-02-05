const DIALOGUE_DISCUSSION_SELECT_EVENT_NAME = "dialogue-discussion-select";

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

declare global {
  interface HTMLElementEventMap {
    [DIALOGUE_DISCUSSION_SELECT_EVENT_NAME]: DialogueDiscussionSelectEvent;
  }
}
