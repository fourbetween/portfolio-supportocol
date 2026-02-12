import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { userContext } from "../../../app/context/user";
import { workspaceContext } from "../../../app/context/workspace";
import type { User } from "../../../app/model/user";
import type { WorkspaceWithMember } from "../../../app/model/workspace";
import { showToast } from "../../../shared/event/toast";
import { WorkspaceWorkspaceSelectEvent } from "../event/workspace";
import { workspaceRepository } from "../repository/workspace-repository";
import "../ui/workspace-select";

@customElement("workspace-workspace-select-widget")
export class WorkspaceWorkspaceSelectWidget extends LitElement {
  @consume({ context: userContext, subscribe: true })
  @state()
  user?: User;

  @consume({ context: workspaceContext, subscribe: true })
  @state()
  selectedWorkspace?: WorkspaceWithMember;

  @state()
  private workspaces: WorkspaceWithMember[] = [];

  constructor() {
    super();

    new Task(this, {
      task: async ([user]) => {
        if (!user) {
          return [] as WorkspaceWithMember[];
        }
        return workspaceRepository.getMyWorkspacesWithMember();
      },
      onComplete: (workspaces) => {
        if (!this.selectedWorkspace && workspaces.length > 0) {
          this.dispatchEvent(new WorkspaceWorkspaceSelectEvent(workspaces[0]));
        }
        this.workspaces = workspaces;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.user],
    });
  }

  render() {
    if (!this.user) {
      return html``;
    }
    if (this.workspaces.length < 2) {
      return html``;
    }

    return html`
      <div class="widget">
        <workspace-workspace-select
          .workspaces=${this.workspaces}
          .selectedWorkspaceId=${this.selectedWorkspace?.workspace.id}
        ></workspace-workspace-select>
      </div>
    `;
  }
}
