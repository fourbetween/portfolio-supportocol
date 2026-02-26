export const WORKSPACE_DISCUSSION_MOVE_EVENT_NAME = "workspace-discussion-move";
export const WORKSPACE_DISCUSSION_MOVED_EVENT_NAME =
  "workspace-discussion-moved";
export const WORKSPACE_DISCUSSION_SELECT_TOGGLE_EVENT_NAME =
  "workspace-discussion-select-toggle";
export const WORKSPACE_DISCUSSION_CLEAR_SELECTION_EVENT_NAME =
  "workspace-discussion-clear-selection";

export class WorkspaceDiscussionMoveEvent extends Event {
  public readonly discussionIds: string[];
  public readonly targetProjectId: string;

  constructor(discussionIds: string[], targetProjectId: string) {
    super(WORKSPACE_DISCUSSION_MOVE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.discussionIds = discussionIds;
    this.targetProjectId = targetProjectId;
  }
}

export class WorkspaceDiscussionMovedEvent extends Event {
  public readonly discussionIds: string[];
  public readonly targetProjectId: string;

  constructor(discussionIds: string[], targetProjectId: string) {
    super(WORKSPACE_DISCUSSION_MOVED_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.discussionIds = discussionIds;
    this.targetProjectId = targetProjectId;
  }
}

export class WorkspaceDiscussionSelectToggleEvent extends Event {
  public readonly discussionId: string;

  constructor(discussionId: string) {
    super(WORKSPACE_DISCUSSION_SELECT_TOGGLE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.discussionId = discussionId;
  }
}

export class WorkspaceDiscussionClearSelectionEvent extends Event {
  constructor() {
    super(WORKSPACE_DISCUSSION_CLEAR_SELECTION_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
  }
}

declare global {
  interface HTMLElementEventMap {
    [WORKSPACE_DISCUSSION_MOVE_EVENT_NAME]: WorkspaceDiscussionMoveEvent;
    [WORKSPACE_DISCUSSION_MOVED_EVENT_NAME]: WorkspaceDiscussionMovedEvent;
    [WORKSPACE_DISCUSSION_SELECT_TOGGLE_EVENT_NAME]: WorkspaceDiscussionSelectToggleEvent;
    [WORKSPACE_DISCUSSION_CLEAR_SELECTION_EVENT_NAME]: WorkspaceDiscussionClearSelectionEvent;
  }
}
