import type { WorkspaceWithMember } from "../model/workspace";

export class WorkspaceWorkspaceSelectEvent extends Event {
  static get eventName() { return "workspace-workspace-select" as const; }
  public readonly workspace?: WorkspaceWithMember;

  constructor(workspace?: WorkspaceWithMember) {
    super(WorkspaceWorkspaceSelectEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.workspace = workspace;
  }
}

declare global {
  interface HTMLElementEventMap {
    [WorkspaceWorkspaceSelectEvent.eventName]: WorkspaceWorkspaceSelectEvent;
  }
}
