import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { client } from "../../../api/client";
import { accountMethods } from "../../../model/account";
import type {
  CommentPermissionLevel,
  VisibilityLevel,
} from "../../../model/discussion";
import { baseStyle } from "../../../style/base";
import type { CreateDiscussionData } from "../../presenter/popup/discussion/create";

@customElement("dashboard-page-container")
export class DashboardPageContainer extends LitElement {
  @property({ type: Boolean })
  isLoggedIn = false;

  private projectsTask = new Task(this, {
    task: async ([]) => {
      const { data, error } = await client.GET("/projects", {
        headers: await accountMethods.authHeader(),
      });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    args: () => [],
  });

  private discussionsTask = new Task(this, {
    task: async ([]) => {
      const { data, error } = await client.GET("/discussions", {
        headers: await accountMethods.authHeader(),
      });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    args: () => [],
  });

  render() {
    return html`
      <div class="container">
        <div class="side">
          ${this.projectsTask.render({
            complete: (projects) => html`
              <project-list-presenter
                .projects=${projects}
                .onCreate=${(name: string) => this.createProject(name)}
              ></project-list-presenter>
            `,
            error: (e) =>
              html`
                <p>Error: ${e}</p>
              `,
          })}
        </div>
        <div class="main">
          ${this.discussionsTask.render({
            complete: (discussions) => html`
              <discussion-list-presenter
                .discussions=${discussions}
                .onCreate=${(data: CreateDiscussionData) =>
                  this.createDiscussion(data)}
              ></discussion-list-presenter>
            `,
            error: (e) =>
              html`
                <p>Error: ${e}</p>
              `,
          })}
        </div>
      </div>
    `;
  }

  private async createDiscussion(data: CreateDiscussionData) {
    const { error } = await client.POST("/discussions", {
      headers: await accountMethods.authHeader(),
      body: {
        ...data,
        visibilityLevel: data.visibilityLevel as VisibilityLevel,
        commentPermissionLevel:
          data.commentPermissionLevel as CommentPermissionLevel,
        conclusion: "",
      },
    });
    if (error) {
      console.error(error);
      return;
    }
    this.discussionsTask.run();
  }

  private async createProject(name: string) {
    const { error } = await client.POST("/projects", {
      headers: await accountMethods.authHeader(),
      body: { name },
    });
    if (error) {
      console.error(error);
      return;
    }
    this.projectsTask.run();
  }

  static styles = [
    baseStyle,
    css`
      .container {
        display: flex;
        height: 100%;
        gap: 16px;
      }

      .side {
        width: 300px;
      }

      .main {
        flex: 1;
      }
    `,
  ];
}
