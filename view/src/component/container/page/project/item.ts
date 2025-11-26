import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { LitElement, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { client } from "../../../../api/client";
import { routerContext } from "../../../../context/router";
import { accountMethods } from "../../../../model/account";
import type { Discussion } from "../../../../model/discussion";
import type { Project } from "../../../../model/project";
import { buildPath, navigate } from "../../../../routes";
import { baseStyle } from "../../../../style/base";
import type { ConfirmPopupPresenter } from "../../../presenter/popup/confirm";
import type { EditProjectPopupPresenter } from "../../../presenter/popup/project/edit";

@customElement("item-project-page-container")
export class ItemProjectPageContainer extends LitElement {
  @consume({ context: routerContext })
  @property({ attribute: false })
  router?: Router;

  @property({ type: String })
  projectId = "";

  @query("edit-project-popup-presenter")
  private editProjectPopup!: EditProjectPopupPresenter;

  @query("confirm-popup-presenter")
  private confirmPopup!: ConfirmPopupPresenter;

  @state()
  private project?: Project;

  @state()
  private discussions: Discussion[] = [];

  constructor() {
    super();

    new Task(this, {
      task: async ([projectId]) => {
        if (!projectId) return undefined;
        const { data, error } = await client.GET("/projects/{projectId}", {
          headers: await accountMethods.authHeader(),
          params: { path: { projectId } },
        });
        if (error) {
          throw new Error(error.message);
        }
        return data;
      },
      args: () => [this.projectId] as const,
      onComplete: (data) => {
        this.project = data;
      },
    });

    new Task(this, {
      task: async ([projectId]) => {
        if (!projectId) return [] as Discussion[];
        const { data, error } = await client.GET("/discussions", {
          headers: await accountMethods.authHeader(),
          params: { query: { projectId } },
        });
        if (error) {
          throw new Error(error.message);
        }
        return data;
      },
      args: () => [this.projectId] as const,
      onComplete: (data) => {
        this.discussions = data;
      },
    });
  }

  render() {
    if (!this.project) {
      return nothing;
    }

    return html`
      <item-project-page-presenter
        .project=${this.project}
        .discussions=${this.discussions}
        .getDiscussionLink=${this.getDiscussionLink}
        .onCreateDiscussion=${this.handleCreateDiscussion}
        .onEditProject=${this.handleOpenEditProjectPopup}
        .onDeleteProject=${this.handleOpenDeleteConfirmPopup}
      ></item-project-page-presenter>
      <edit-project-popup-presenter
        .projectName=${this.project?.name ?? ""}
        .onSave=${this.handleSaveProject}
        .onCancel=${this.handleCancelEditProject}
      ></edit-project-popup-presenter>
      <confirm-popup-presenter
        .title=${"プロジェクトを削除"}
        .message=${"このプロジェクトを削除してもよろしいですか？"}
        .confirmLabel=${"削除"}
        .cancelLabel=${"キャンセル"}
        .onConfirm=${this.handleDeleteProject}
        .onCancel=${this.handleCancelDelete}
      ></confirm-popup-presenter>
    `;
  }

  private getDiscussionLink = (id: string): string => {
    return buildPath("discussion", { id });
  };

  private handleCreateDiscussion = () => {
    if (this.router) {
      navigate(this.router, "discussion_new");
    }
  };

  private handleOpenEditProjectPopup = () => {
    this.editProjectPopup.open();
  };

  private handleSaveProject = async (name: string) => {
    const { data, error } = await client.PUT("/projects/{projectId}", {
      headers: await accountMethods.authHeader(),
      params: { path: { projectId: this.projectId } },
      body: { name },
    });
    if (error) {
      console.error("Failed to update project:", error.message);
      return;
    }
    this.project = data;
    this.editProjectPopup.close();
  };

  private handleCancelEditProject = () => {
    this.editProjectPopup.close();
  };

  private handleOpenDeleteConfirmPopup = () => {
    this.confirmPopup.open();
  };

  private handleDeleteProject = async () => {
    const { error } = await client.DELETE("/projects/{projectId}", {
      headers: await accountMethods.authHeader(),
      params: { path: { projectId: this.projectId } },
    });
    if (error) {
      console.error("Failed to delete project:", error.message);
      return;
    }
    this.confirmPopup.close();
    if (this.router) {
      await navigate(this.router, "dashboard");
    }
  };

  private handleCancelDelete = () => {
    this.confirmPopup.close();
  };

  static styles = [baseStyle];
}
