export class LearningIssueRemoveEvent extends Event {
  static get eventName() { return "learning-issue-remove" as const; }
  public readonly commentId: string;
  public readonly issueId: string;

  constructor(commentId: string, issueId: string) {
    super(LearningIssueRemoveEvent.eventName, { bubbles: true, composed: true });
    this.commentId = commentId;
    this.issueId = issueId;
  }
}

declare global {
  interface HTMLElementEventMap {
    [LearningIssueRemoveEvent.eventName]: LearningIssueRemoveEvent;
  }
}
