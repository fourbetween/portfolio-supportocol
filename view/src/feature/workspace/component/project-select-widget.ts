import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { userContext } from "../../../app/context/user";
import type { User } from "../../../app/model/user";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import type { Project } from "../model/project";
import { projectRepository } from "../repository/project-repository";
import "../ui/project-select/project-select";

@customElement("workspace-project-select-widget")
export class WorkspaceProjectSelectWidget extends LitElement {
  @property({ type: String })
  selectedProjectId = "";

  @state()
  private projects: Project[] = [];

  @consume({ context: userContext, subscribe: true })
  @state()
  private user?: User;

  constructor() {
    super();

    new Task(this, {
      task: async () => {
        if (!this.user) {
          return [] as Project[];
        }
        return projectRepository.list("personal-" + this.user.id);
      },
      onComplete: (projects: Project[]) => {
        this.projects = projects;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [],
    });
  }

  render() {
    return html`
      <div class="widget">
        <workspace-project-select
          .projects=${this.projects}
          .selectedProjectId=${this.selectedProjectId}
        ></workspace-project-select>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .widget {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }
    `,
  ];
}
