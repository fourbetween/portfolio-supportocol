import type {
  CommentIssueDescription,
  CommentIssueTitle,
} from "../model/comment";

export class DialogueIssueCreateEvent extends Event {
  static get eventName() { return "dialogue-issue-create" as const; }
  public readonly title: CommentIssueTitle;
  public readonly description: CommentIssueDescription;

  constructor(title: CommentIssueTitle, description: CommentIssueDescription) {
    super(DialogueIssueCreateEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.title = title;
    this.description = description;
  }
}

declare global {
  interface HTMLElementEventMap {
    [DialogueIssueCreateEvent.eventName]: DialogueIssueCreateEvent;
  }
}
