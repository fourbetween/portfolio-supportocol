import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { msg } from "@lit/localize";
import { Task } from "@lit/task";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { routerContext } from "../../../app/context/router";
import { workspaceContext } from "../../../app/context/workspace";
import type { WorkspaceWithMember } from "../../../app/model/workspace";
import { navigate, paths } from "../../../app/paths";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { widgetStyle } from "../../../shared/style/widget";
import { discussionRepository } from "../../learning/repository/discussion-repository";
import {
  WorkspaceDiscussionClearSelectionEvent,
  WorkspaceDiscussionMoveEvent,
  WorkspaceDiscussionSelectToggleEvent,
} from "../event/discussion-move";
import {
  WorkspaceProjectDeleteEvent,
  WorkspaceProjectDeletedEvent,
  WorkspaceProjectUpdateEvent,
  WorkspaceProjectUpdatedEvent,
} from "../event/project";
import type { DiscussionSummaryForMove } from "../model/discussion-move";
import type { Project } from "../model/project";
import { projectRepository } from "../repository/project-repository";
import "../ui/discussion-move-bar";
import "../ui/project-detail";
import "../ui/project-discussion-select-list";

@customElement("workspace-project-detail-widget")
export class WorkspaceProjectDetailWidget extends LitElement {
  @property({ type: String })
  projectId = "";

  @consume({ context: workspaceContext, subscribe: true })
  @state()
  workspace?: WorkspaceWithMember;

  @consume({ context: routerContext, subscribe: true })
  @state()
  private _router?: Router;

  @state()
  private _project?: Project;

  @state()
  private _projects: Project[] = [];

  @state()
  private _discussions: DiscussionSummaryForMove[] = [];

  @state()
  private _selectedIds: string[] = [];

  @state()
  private _loading = false;

  @state()
  private _moving = false;

  private _fetchTask = new Task(this, {
    task: async ([workspace, projectId]) => {
      if (!workspace || !projectId) return;
      this._loading = true;
      try {
        const projects = await projectRepository.list(workspace.workspace.id);
        this._projects = projects;
        this._project = projects.find((p) => p.id === projectId);

        if (!this._project) {
          showToast(this, msg("Project not found."), "error");
          return;
        }

        const discussions = await discussionRepository.list(
          workspace.workspace.id,
          projectId,
        );
        this._discussions = discussions.map((d) => ({
          id: d.id,
          projectId: d.projectId,
          theme: d.theme,
        }));
      } finally {
        this._loading = false;
      }
    },
    onError: (e: unknown) => {
      showToast(this, String(e), "error");
      this._loading = false;
    },
    args: () => [this.workspace, this.projectId] as const,
  });

  private _handleToggle(e: WorkspaceDiscussionSelectToggleEvent) {
    const id = e.discussionId;
    if (this._selectedIds.includes(id)) {
      this._selectedIds = this._selectedIds.filter((s) => s !== id);
    } else {
      this._selectedIds = [...this._selectedIds, id];
    }
  }

  private _handleClear(_e: WorkspaceDiscussionClearSelectionEvent) {
    this._selectedIds = [];
  }

  private async _handleMove(e: WorkspaceDiscussionMoveEvent) {
    if (!this.workspace || this._selectedIds.length === 0) return;

    this._moving = true;
    try {
      await projectRepository.moveDiscussions(
        this.workspace.workspace.id,
        e.targetProjectId,
        this._selectedIds,
      );
      showToast(this, msg("Discussions moved successfully."), "success", 2000);

      this._selectedIds = [];
      discussionRepository.clearAllListCache();
      this._fetchTask.run([this.workspace, this.projectId]);
    } catch (error: any) {
      showToast(this, error.message, "error");
    } finally {
      this._moving = false;
    }
  }

  private async _handleUpdate(e: WorkspaceProjectUpdateEvent) {
    if (!this.workspace) return;
    try {
      const updatedProject = await projectRepository.update(
        this.workspace.workspace.id,
        e.projectId,
        e.name,
        e.premise,
      );
      this._project = updatedProject;
      showToast(this, msg("Project updated successfully."), "success", 2000);
      this.dispatchEvent(new WorkspaceProjectUpdatedEvent(updatedProject));
    } catch (e: any) {
      showToast(this, e.message, "error");
    }
  }

  private async _handleDelete(e: WorkspaceProjectDeleteEvent) {
    if (!this.workspace || !this._router) return;
    try {
      await projectRepository.delete(this.workspace.workspace.id, e.projectId);
      showToast(this, msg("Project deleted successfully."), "success", 2000);
      this.dispatchEvent(new WorkspaceProjectDeletedEvent(e.projectId));
      navigate(this._router, paths.workspace.projects);
    } catch (e: any) {
      showToast(this, e.message, "error");
    }
  }

  render() {
    if (this._loading && !this._project) {
      return html`
        <div class="loading">${msg("Loading...")}</div>
      `;
    }

    if (!this._project) {
      return html`
        <div class="loading">${msg("Project not found.")}</div>
      `;
    }

    const otherProjects = this._projects.filter((p) => p.id !== this.projectId);

    return html`
      <div class="container">
        <workspace-project-detail
          .project=${this._project}
          @workspace-project-update=${(e: WorkspaceProjectUpdateEvent) =>
            this._handleUpdate(e)}
          @workspace-project-delete=${(e: WorkspaceProjectDeleteEvent) =>
            this._handleDelete(e)}
        ></workspace-project-detail>

        <div class="section">
          <h3 class="section-title">${msg("Discussions")}</h3>
          <workspace-project-discussion-select-list
            .discussions=${this._discussions}
            .selectedIds=${this._selectedIds}
            @workspace-discussion-select-toggle=${(
              e: WorkspaceDiscussionSelectToggleEvent,
            ) => this._handleToggle(e)}
            @workspace-discussion-clear-selection=${(
              e: WorkspaceDiscussionClearSelectionEvent,
            ) => this._handleClear(e)}
          ></workspace-project-discussion-select-list>
          ${this._selectedIds.length > 0
            ? html`
                <workspace-discussion-move-bar
                  .selectedCount=${this._selectedIds.length}
                  .projects=${otherProjects}
                  .loading=${this._moving}
                  @workspace-discussion-move=${(
                    e: WorkspaceDiscussionMoveEvent,
                  ) => this._handleMove(e)}
                  @workspace-discussion-clear-selection=${(
                    e: WorkspaceDiscussionClearSelectionEvent,
                  ) => this._handleClear(e)}
                ></workspace-discussion-move-bar>
              `
            : nothing}
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    widgetStyle,
    css`
      .section-title {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--color-fg-default);
      }
    `,
  ];
}
