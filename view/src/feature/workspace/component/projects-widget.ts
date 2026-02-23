import { consume } from "@lit/context";
import { msg } from "@lit/localize";
import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { workspaceContext } from "../../../app/context/workspace";
import type { WorkspaceWithMember } from "../../../app/model/workspace";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { widgetStyle } from "../../../shared/style/widget";
import {
  WorkspaceProjectCreateEvent,
  WorkspaceProjectCreatedEvent,
  WorkspaceProjectDeleteEvent,
  WorkspaceProjectDeletedEvent,
  WorkspaceProjectUpdateEvent,
  WorkspaceProjectUpdatedEvent,
} from "../event/project";
import type { Project } from "../model/project";
import { projectRepository } from "../repository/project-repository";
import "../ui/project-add-form";
import "../ui/project-list";

@customElement("workspace-projects-widget")
export class WorkspaceProjectsWidget extends LitElement {
  @consume({ context: workspaceContext, subscribe: true })
  @state()
  workspace?: WorkspaceWithMember;

  @state()
  private projects: Project[] = [];

  constructor() {
    super();

    new Task(this, {
      task: async ([workspace]) => {
        if (!workspace) {
          return [] as Project[];
        }
        return projectRepository.list(workspace.workspace.id);
      },
      onComplete: (projects: Project[]) => {
        this.projects = projects;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.workspace],
    });
  }

  private async handleCreate(e: WorkspaceProjectCreateEvent) {
    if (!this.workspace) return;
    try {
      const project = await projectRepository.create(
        this.workspace.workspace.id,
        e.name,
      );
      this.projects = [...this.projects, project];
      showToast(this, msg("Project created successfully."), "success", 2000);
      this.dispatchEvent(new WorkspaceProjectCreatedEvent(project));
    } catch (e: any) {
      showToast(this, e.message, "error");
    }
  }

  private async handleUpdate(e: WorkspaceProjectUpdateEvent) {
    if (!this.workspace) return;
    try {
      const updatedProject = await projectRepository.update(
        this.workspace.workspace.id,
        e.projectId,
        e.name,
        e.premise,
      );
      this.projects = this.projects.map((p) =>
        p.id === e.projectId ? updatedProject : p,
      );
      showToast(this, msg("Project updated successfully."), "success", 2000);
      this.dispatchEvent(new WorkspaceProjectUpdatedEvent(updatedProject));
    } catch (e: any) {
      showToast(this, e.message, "error");
    }
  }

  private async handleDelete(e: WorkspaceProjectDeleteEvent) {
    if (!this.workspace) return;
    try {
      await projectRepository.delete(this.workspace.workspace.id, e.projectId);
      this.projects = this.projects.filter((p) => p.id !== e.projectId);
      showToast(this, msg("Project deleted successfully."), "success", 2000);
      this.dispatchEvent(new WorkspaceProjectDeletedEvent(e.projectId));
    } catch (e: any) {
      showToast(this, e.message, "error");
    }
  }

  render() {
    return html`
      <div class="container-tight">
        <workspace-project-add-form
          class="add-form"
          @workspace-project-create=${(e: WorkspaceProjectCreateEvent) =>
            this.handleCreate(e)}
        ></workspace-project-add-form>
        <workspace-project-list
          .projects=${this.projects}
          @workspace-project-update=${(e: WorkspaceProjectUpdateEvent) =>
            this.handleUpdate(e)}
          @workspace-project-delete=${(e: WorkspaceProjectDeleteEvent) =>
            this.handleDelete(e)}
        ></workspace-project-list>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    widgetStyle,
    css`
      .add-form {
        margin-bottom: 8px;
      }
    `,
  ];
}
