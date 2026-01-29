export const WORKSPACE_PROJECT_SELECT_EVENT_NAME = "workspace-project-select";

export class WorkspaceProjectSelectEvent extends Event {
  public readonly projectId: string;

  constructor(projectId: string) {
    super(WORKSPACE_PROJECT_SELECT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.projectId = projectId;
  }
}

declare global {
  interface HTMLElementEventMap {
    [WORKSPACE_PROJECT_SELECT_EVENT_NAME]: WorkspaceProjectSelectEvent;
  }
}
