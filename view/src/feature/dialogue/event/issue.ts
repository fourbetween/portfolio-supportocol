import type {
  CommentIssueDescription,
  CommentIssueTitle,
} from "../model/comment";

const DIALOGUE_ISSUE_CREATE_EVENT_NAME = "dialogue-issue-create";
const DIALOGUE_ISSUE_CREATE_CANCEL_EVENT_NAME = "dialogue-issue-create-cancel";

export class DialogueIssueCreateEvent extends Event {
  public readonly title: CommentIssueTitle;
  public readonly description: CommentIssueDescription;

  constructor(title: CommentIssueTitle, description: CommentIssueDescription) {
    super(DIALOGUE_ISSUE_CREATE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.title = title;
    this.description = description;
  }
}

export class DialogueIssueCreateCancelEvent extends Event {
  constructor() {
    super(DIALOGUE_ISSUE_CREATE_CANCEL_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
  }
}

declare global {
  interface HTMLElementEventMap {
    [DIALOGUE_ISSUE_CREATE_EVENT_NAME]: DialogueIssueCreateEvent;
    [DIALOGUE_ISSUE_CREATE_CANCEL_EVENT_NAME]: DialogueIssueCreateCancelEvent;
  }
}
