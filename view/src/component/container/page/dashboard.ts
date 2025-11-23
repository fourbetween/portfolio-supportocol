import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { client } from "../../../api/client";
import { accountMethods } from "../../../model/account";
import { baseStyle } from "../../../style/base";

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

  render() {
    return html`
      <div class="container">
        <div class="side">
          ${this.projectsTask.render({
            complete: (projects) => html`
              <project-list-presenter
                .projects=${projects}
              ></project-list-presenter>
            `,
            error: (e) =>
              html`
                <p>Error: ${e}</p>
              `,
          })}
        </div>
        <div class="main">
          <discussion-list-presenter
            .discussions=${[]}
          ></discussion-list-presenter>
        </div>
      </div>
    `;
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
