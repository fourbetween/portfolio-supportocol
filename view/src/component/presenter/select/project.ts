import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Project } from "../../../model/project";
import { baseStyle } from "../../../style/base";

@customElement("project-select-presenter")
export class ProjectSelectPresenter extends LitElement {
  @property({ type: Array })
  projects: Project[] = [];

  @property({ type: String })
  selectedProjectId = "";

  render() {
    return html`
      <label class="select-wrapper">
        <span class="label-text">Project</span>
        <select
          id="project-select"
          class="project-select"
          @change=${this._handleChange}
        >
          <option value="">All Projects</option>
          ${this.projects.map(
            (project) => html`
              <option value=${project.id}>${project.name}</option>
            `
          )}
        </select>
      </label>
    `;
  }

  private _handleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    this.selectedProjectId = target.value;
    this.dispatchEvent(
      new CustomEvent("project-change", {
        detail: { projectId: this.selectedProjectId },
        bubbles: true,
        composed: true,
      })
    );
  }

  static styles = [
    baseStyle,
    css`
      :host {
        display: inline-block;
      }

      .select-wrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        color: rgb(101 109 118);
        cursor: default;
      }

      .label-text {
        display: none;
      }

      @media (min-width: 768px) {
        .label-text {
          display: inline;
        }
      }

      .project-select {
        height: 2.5rem;
        border-radius: 0.5rem;
        border: 1px solid #d0d7de;
        background-color: #e7edf3;
        color: #1f2328;
        padding-left: 0.75rem;
        padding-right: 0.75rem;
        cursor: pointer;
      }

      .project-select:focus {
        outline: 2px solid #1976d2;
        outline-offset: 2px;
      }
    `,
  ];
}
