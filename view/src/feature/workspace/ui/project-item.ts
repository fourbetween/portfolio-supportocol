import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { buildPath, paths } from "../../../app/paths";
import { baseStyle } from "../../../shared/style/base";
import { listStyles } from "../../../shared/style/list";
import "../../../shared/ui/icons/icon-chevron-right";
import type { Project } from "../model/project";

@customElement("workspace-project-item")
export class WorkspaceProjectItem extends LitElement {
  @property({ type: Object })
  project!: Project;

  render() {
    const href = buildPath(paths.workspace.project, {
      projectId: this.project.id,
    });

    return html`
      <a class="item" href=${href}>
        <span class="name">
          ${this.project.isDefault ? msg("Uncategorized") : this.project.name}
        </span>
        ${this.project.isDefault
          ? html`
              <span class="badge">${msg("Default")}</span>
            `
          : html``}
        <ui-icon-chevron-right></ui-icon-chevron-right>
      </a>
    `;
  }

  static styles = [
    baseStyle,
    listStyles,
    css`
      .item {
        gap: 8px;
        text-decoration: none;
        color: inherit;
      }
      .name {
        flex: 1;
      }
      .badge {
        font-size: 0.75rem;
        padding: 2px 6px;
        background-color: var(--color-neutral-muted);
        border-radius: 12px;
        color: var(--color-fg-muted);
      }
    `,
  ];
}
