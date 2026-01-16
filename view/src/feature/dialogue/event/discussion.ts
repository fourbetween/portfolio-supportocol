const DIALOGUE_DISCUSSION_SELECT_EVENT_NAME = "dialogue-discussion-select";

export class DialogueDiscussionSelectEvent extends Event {
  public readonly discussionId: string;

  constructor(discussionId: string) {
    super(DIALOGUE_DISCUSSION_SELECT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.discussionId = discussionId;
  }
}

declare global {
  interface HTMLElementEventMap {
    [DIALOGUE_DISCUSSION_SELECT_EVENT_NAME]: DialogueDiscussionSelectEvent;
  }
}
