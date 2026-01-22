import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { inputStyle } from "../../../../shared/style/input";
import { WorkspaceProjectSelectEvent } from "../../event/project";
import type { Project } from "../../model/project";

@customElement("workspace-project-select")
export class WorkspaceProjectSelect extends LitElement {
  @property({ type: Array })
  projects: Project[] = [];

  @property({ type: String })
  selectedProjectId = "";

  private onChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.dispatchEvent(new WorkspaceProjectSelectEvent(select.value));
  }

  render() {
    return html`
      <select .value=${this.selectedProjectId} @change=${this.onChange}>
        <option value="">Select a project</option>
        ${this.projects.map(
          (project) => html`
            <option
              value=${project.id}
              ?selected=${this.selectedProjectId === project.id}
            >
              ${project.name}
            </option>
          `,
        )}
      </select>
    `;
  }

  static styles = [
    baseStyle,
    inputStyle,
    css`
      select {
        padding: 5px 12px;
        font-size: 14px;
        line-height: 20px;
        color: var(--color-fg-default);
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        outline: none;
        width: 100%;
      }

      select:focus {
        border-color: var(--color-accent-fg);
        box-shadow: inset 0 0 0 1px var(--color-accent-fg);
      }
    `,
  ];
}
