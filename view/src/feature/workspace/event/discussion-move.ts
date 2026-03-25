export class WorkspaceDiscussionMoveEvent extends Event {
  static get eventName() { return "workspace-discussion-move" as const; }
  public readonly discussionIds: string[];
  public readonly targetProjectId: string;

  constructor(discussionIds: string[], targetProjectId: string) {
    super(WorkspaceDiscussionMoveEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.discussionIds = discussionIds;
    this.targetProjectId = targetProjectId;
  }
}

export class WorkspaceDiscussionMovedEvent extends Event {
  static get eventName() { return "workspace-discussion-moved" as const; }
  public readonly discussionIds: string[];
  public readonly targetProjectId: string;

  constructor(discussionIds: string[], targetProjectId: string) {
    super(WorkspaceDiscussionMovedEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.discussionIds = discussionIds;
    this.targetProjectId = targetProjectId;
  }
}

export class WorkspaceDiscussionSelectToggleEvent extends Event {
  static get eventName() { return "workspace-discussion-select-toggle" as const; }
  public readonly discussionId: string;

  constructor(discussionId: string) {
    super(WorkspaceDiscussionSelectToggleEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.discussionId = discussionId;
  }
}

export class WorkspaceDiscussionClearSelectionEvent extends Event {
  static get eventName() { return "workspace-discussion-clear-selection" as const; }
  constructor() {
    super(WorkspaceDiscussionClearSelectionEvent.eventName, {
      bubbles: true,
      composed: true,
    });
  }
}

declare global {
  interface HTMLElementEventMap {
    [WorkspaceDiscussionMoveEvent.eventName]: WorkspaceDiscussionMoveEvent;
    [WorkspaceDiscussionMovedEvent.eventName]: WorkspaceDiscussionMovedEvent;
    [WorkspaceDiscussionSelectToggleEvent.eventName]: WorkspaceDiscussionSelectToggleEvent;
    [WorkspaceDiscussionClearSelectionEvent.eventName]: WorkspaceDiscussionClearSelectionEvent;
  }
}
