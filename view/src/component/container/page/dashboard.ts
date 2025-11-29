import { Task } from "@lit/task";
import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { client } from "../../../api/client";
import { accountMethods } from "../../../model/account";
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
        const { data, error } = await client.GET("/projects", {
          headers: await accountMethods.authHeader(),
        });
        if (error) {
          throw new Error(error.message);
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
        const { data, error } = await client.GET("/discussions", {
          headers: await accountMethods.authHeader(),
        });
        if (error) {
          throw new Error(error.message);
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
      headers: await accountMethods.authHeader(),
      body: { name },
    });
    if (error) {
      console.error("Failed to create project:", error.message);
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
