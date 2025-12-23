import { Task } from "@lit/task";
import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { client } from "../../../api/client";
import { showToast } from "../../../event/toast";
import type { Discussion } from "../../../model/discussion";
import type { Project } from "../../../model/project";
import { buildPath } from "../../../routes";
import type { CreateProjectPopupPresenter } from "../../presenter/popup/project/create";

@customElement("dashboard-page-container")
export class DashboardPageContainer extends LitElement {
  @query("create-project-popup-presenter")
  private createProjectPopup!: CreateProjectPopupPresenter;

  @state()
  private projects: Project[] = [];

  @state()
  private recentDiscussions: Discussion[] = [];

  constructor() {
    super();

    new Task(this, {
      task: async () => {
        const { data, error } = await client.GET("/projects");
        if (error) {
          showToast(
            this,
            `プロジェクトの取得に失敗しました: ${error.message}`,
            "error"
          );
          return [] as Project[];
        }
        return data;
      },
      args: () => [],
      onComplete: (data) => {
        this.projects = data ?? [];
      },
    });

    new Task(this, {
      task: async () => {
        const { data, error } = await client.GET("/discussions");
        if (error) {
          showToast(
            this,
            `議論の取得に失敗しました: ${error.message}`,
            "error"
          );
          return [] as Discussion[];
        }
        return data;
      },
      args: () => [],
      onComplete: (data) => {
        this.recentDiscussions = data ?? [];
      },
    });
  }

  render() {
    return html`
      <dashboard-page-presenter
        .projects=${this.projects}
        .recentDiscussions=${this.recentDiscussions}
        .onCreateProject=${this.handleOpenCreateProjectPopup}
        .getProjectLink=${this.getProjectLink}
        .getDiscussionLink=${this.getDiscussionLink}
      ></dashboard-page-presenter>
      <create-project-popup-presenter
        .onCreate=${this.handleCreateProject}
        .onCancel=${this.handleCancelCreateProject}
      ></create-project-popup-presenter>
    `;
  }

  private handleOpenCreateProjectPopup = () => {
    this.createProjectPopup.open();
  };

  private handleCreateProject = async (name: string) => {
    const { data, error } = await client.POST("/projects", {
      body: { name },
    });
    if (error) {
      showToast(
        this,
        `プロジェクトの作成に失敗しました: ${error.message}`,
        "error"
      );
      return;
    }
    this.createProjectPopup.close();
    this.projects = [...this.projects, data];
  };

  private handleCancelCreateProject = () => {
    this.createProjectPopup.close();
  };

  private getProjectLink = (id: string): string => {
    return buildPath("project_item", { id });
  };

  private getDiscussionLink = (id: string): string => {
    return buildPath("discussion_item", { id });
  };
}
