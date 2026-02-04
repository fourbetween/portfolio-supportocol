export const LEARNING_ISSUE_REMOVE_EVENT_NAME = "learning-issue-remove";

export class LearningIssueRemoveEvent extends Event {
  public readonly commentId: string;
  public readonly issueId: string;

  constructor(commentId: string, issueId: string) {
    super(LEARNING_ISSUE_REMOVE_EVENT_NAME, { bubbles: true, composed: true });
    this.commentId = commentId;
    this.issueId = issueId;
  }
}

declare global {
  interface HTMLElementEventMap {
    [LEARNING_ISSUE_REMOVE_EVENT_NAME]: LearningIssueRemoveEvent;
  }
}
