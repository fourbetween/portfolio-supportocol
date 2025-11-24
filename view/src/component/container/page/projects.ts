import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { client } from "../../../api/client";
import { accountMethods } from "../../../model/account";
import { baseStyle } from "../../../style/base";

@customElement("projects-page-container")
export class ProjectsPageContainer extends LitElement {
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
        ${this.projectsTask.render({
          complete: (projects) => html`
            <project-list-presenter
              .projects=${projects}
              .onCreate=${(name: string) => this.handleCreateProject(name)}
            ></project-list-presenter>
          `,
          error: (e) =>
            html`
              <p>Error: ${e}</p>
            `,
        })}
      </div>
    `;
  }

  private async handleCreateProject(name: string) {
    const { error } = await client.POST("/projects", {
      headers: await accountMethods.authHeader(),
      body: {
        name,
      },
    });
    if (error) {
      console.error(error);
      return;
    }
    this.projectsTask.run();
  }

  static styles = [baseStyle, css``];
}
