import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { listStyles } from "../../../shared/style/list";
import type { Project } from "../model/project";
import "./project-item";

@customElement("workspace-project-list")
export class WorkspaceProjectList extends LitElement {
  @property({ type: Array })
  projects: Project[] = [];

  render() {
    if (this.projects.length === 0) {
      return html`
        <div class="empty">${msg("No projects found.")}</div>
      `;
    }

    return html`
      <div class="list">
        ${this.projects.map(
          (project) => html`
            <workspace-project-item
              .project=${project}
            ></workspace-project-item>
          `,
        )}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    listStyles,
    css`
      :host {
        display: block;
      }
    `,
  ];
}
