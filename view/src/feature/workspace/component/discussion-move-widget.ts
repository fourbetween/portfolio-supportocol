import { consume } from "@lit/context";
import { msg } from "@lit/localize";
import { Task } from "@lit/task";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { workspaceContext } from "../../../app/context/workspace";
import type { WorkspaceWithMember } from "../../../app/model/workspace";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { widgetStyle } from "../../../shared/style/widget";
import { discussionRepository } from "../../learning/repository/discussion-repository";
import {
  WorkspaceDiscussionClearSelectionEvent,
  WorkspaceDiscussionMoveEvent,
  WorkspaceDiscussionSelectAllEvent,
  WorkspaceDiscussionSelectToggleEvent,
} from "../event/discussion-move";
import type {
  DiscussionSummaryForMove,
  ProjectWithDiscussions,
} from "../model/discussion-move";
import type { Project } from "../model/project";
import { projectRepository } from "../repository/project-repository";
import "../ui/discussion-move-bar";
import "../ui/project-discussion-list";

@customElement("workspace-discussion-move-widget")
export class WorkspaceDiscussionMoveWidget extends LitElement {
  @consume({ context: workspaceContext, subscribe: true })
  @state()
  workspace?: WorkspaceWithMember;

  @state()
  private _projects: Project[] = [];

  @state()
  private _projectDiscussions: ProjectWithDiscussions[] = [];

  @state()
  private _selectedIds: string[] = [];

  @state()
  private _loading = false;

  @state()
  private _moving = false;

  private _fetchTask = new Task(this, {
    task: async ([workspace]) => {
      if (!workspace) return;
      this._loading = true;
      try {
        const projects = await projectRepository.list(workspace.workspace.id);
        this._projects = projects;

        const results: ProjectWithDiscussions[] = await Promise.all(
          projects.map(async (project) => {
            const discussions = await discussionRepository.list(
              workspace.workspace.id,
              project.id,
            );
            const mapped: DiscussionSummaryForMove[] = discussions.map((d) => ({
              id: d.id,
              projectId: d.projectId,
              theme: d.theme,
            }));
            return {
              projectId: project.id,
              projectName: project.name,
              isDefault: project.isDefault,
              discussions: mapped,
            };
          }),
        );

        this._projectDiscussions = results;
      } finally {
        this._loading = false;
      }
    },
    onError: (e: unknown) => {
      showToast(this, String(e), "error");
      this._loading = false;
    },
    args: () => [this.workspace],
  });

  private _handleToggle(e: WorkspaceDiscussionSelectToggleEvent) {
    const id = e.discussionId;
    if (this._selectedIds.includes(id)) {
      this._selectedIds = this._selectedIds.filter((s) => s !== id);
    } else {
      this._selectedIds = [...this._selectedIds, id];
    }
  }

  private _handleSelectAll(e: WorkspaceDiscussionSelectAllEvent) {
    const pd = this._projectDiscussions.find(
      (p) => p.projectId === e.projectId,
    );
    if (!pd) return;

    const projectDiscussionIds = pd.discussions.map((d) => d.id);
    const allSelected = projectDiscussionIds.every((id) =>
      this._selectedIds.includes(id),
    );

    if (allSelected) {
      this._selectedIds = this._selectedIds.filter(
        (id) => !projectDiscussionIds.includes(id),
      );
    } else {
      const newIds = projectDiscussionIds.filter(
        (id) => !this._selectedIds.includes(id),
      );
      this._selectedIds = [...this._selectedIds, ...newIds];
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
      // Clear discussion list cache and refetch
      discussionRepository.clearAllListCache();
      this._fetchTask.run([this.workspace]);
    } catch (error: any) {
      showToast(this, error.message, "error");
    } finally {
      this._moving = false;
    }
  }

  render() {
    if (this._loading && this._projectDiscussions.length === 0) {
      return html`
        <div class="loading">${msg("Loading...")}</div>
      `;
    }

    return html`
      <div class="container">
        <workspace-project-discussion-list
          .projectDiscussions=${this._projectDiscussions}
          .selectedIds=${this._selectedIds}
          @workspace-discussion-select-toggle=${this._handleToggle}
          @workspace-discussion-select-all=${this._handleSelectAll}
        ></workspace-project-discussion-list>
        <workspace-discussion-move-bar
          .selectedCount=${this._selectedIds.length}
          .projects=${this._projects}
          .loading=${this._moving}
          @workspace-discussion-move=${this._handleMove}
          @workspace-discussion-clear-selection=${this._handleClear}
        ></workspace-discussion-move-bar>
      </div>
    `;
  }

  static styles = [baseStyle, widgetStyle];
}
