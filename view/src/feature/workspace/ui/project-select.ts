import { msg } from "@lit/localize";
import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { inputStyle } from "../../../shared/style/input";
import { WorkspaceProjectSelectEvent } from "../event/project";
import { sortProjects, type Project } from "../model/project";

@customElement("workspace-project-select")
export class WorkspaceProjectSelect extends LitElement {
  @property({ type: Array })
  projects: Project[] = [];

  @property({ type: String })
  selectedProjectId = "";

  protected updated(changedProperties: PropertyValues) {
    if (
      (changedProperties.has("projects") ||
        changedProperties.has("selectedProjectId")) &&
      this.projects.length > 0
    ) {
      const isSelectedValid = this.projects.some(
        (p) => p.id === this.selectedProjectId,
      );
      if (!isSelectedValid) {
        const effectiveId = this.effectiveSelectedId;
        if (effectiveId) {
          this.dispatchEvent(new WorkspaceProjectSelectEvent(effectiveId));
        }
      }
    }
  }

  private onChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.dispatchEvent(new WorkspaceProjectSelectEvent(select.value));
  }

  private get effectiveSelectedId() {
    return (
      this.projects.find((p) => p.id === this.selectedProjectId)?.id ||
      this.projects.find((p) => p.isDefault)?.id ||
      ""
    );
  }

  render() {
    const sortedProjects = sortProjects(this.projects);

    const effectiveSelectedId = this.effectiveSelectedId;

    return html`
      <select .value=${effectiveSelectedId} @change=${this.onChange}>
        ${sortedProjects.map(
          (project) => html`
            <option
              value=${project.id}
              ?selected=${effectiveSelectedId === project.id}
            >
              ${project.isDefault ? msg("Uncategorized") : project.name}
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
        width: 100%;
      }
    `,
  ];
}
