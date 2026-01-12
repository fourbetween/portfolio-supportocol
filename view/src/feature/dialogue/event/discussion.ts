import type { Discussion } from "../model/discussion";

const DIALOGUE_DISCUSSION_SELECT_EVENT_NAME = "dialogue-discussion-select";

export class DialogueDiscussionSelectEvent extends Event {
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(DIALOGUE_DISCUSSION_SELECT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.discussion = discussion;
  }
}
