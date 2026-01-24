import type { WorkspaceWithMember } from "../model/workspace";

export const WORKSPACE_WORKSPACE_SELECT_EVENT_NAME =
  "workspace-workspace-select";

export class WorkspaceWorkspaceSelectEvent extends Event {
  public readonly workspace?: WorkspaceWithMember;

  constructor(workspace?: WorkspaceWithMember) {
    super(WORKSPACE_WORKSPACE_SELECT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.workspace = workspace;
  }
}

declare global {
  interface HTMLElementEventMap {
    [WORKSPACE_WORKSPACE_SELECT_EVENT_NAME]: WorkspaceWorkspaceSelectEvent;
  }
}
