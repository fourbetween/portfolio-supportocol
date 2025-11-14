import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Project } from "../../../model/project";
import { baseStyle } from "../../../style/base";
import { iconStyle } from "../../../style/icon";

@customElement("project-card-presenter")
export class ProjectCardPresenter extends LitElement {
  @property({ type: Object })
  project!: Project;

  @property({ type: Number })
  commentCount: number = 0;

  render() {
    return html`
      <div class="project-card">
        <div class="project-card-content">
          <div class="project-card-header">
            <div class="project-card-icon-title">
              <div class="project-card-icon">
                <span class="material-symbols-outlined">folder</span>
              </div>
              <div>
                <h3 class="project-card-title">${this.project.name}</h3>
              </div>
            </div>
            <div class="project-card-menu" role="button">
              <span class="material-symbols-outlined">more_vert</span>
            </div>
          </div>
          <div class="project-card-footer">
            <div class="project-card-stats">
              <div class="project-card-stat">
                <span class="material-symbols-outlined">chat_bubble</span>
                <span>${this.commentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    css`
      .project-card {
        background: white;
        border: 1px solid #d0d7de;
        border-radius: 0.5rem;
        transition: colors 0.15s;
      }

      .project-card-content {
        padding: 1rem;
      }

      .project-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }

      .project-card-icon-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .project-card-icon {
        padding: 0.5rem;
        border-radius: 0.5rem;
        background-color: rgb(59 130 246 / 0.1);
        color: #3b82f6;
      }

      .project-card-title {
        color: #24292f;
        font-size: 1.125rem;
        font-weight: 600;
        cursor: pointer;
      }

      .project-card-title:hover {
        color: #3b82f6;
      }

      .project-card-menu {
        color: #6e7781;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
      }

      .project-card-menu:hover {
        color: #3b82f6;
      }

      .project-card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .project-card-stats {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .project-card-stat {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: #6e7781;
        font-size: 0.875rem;
      }

      .project-card-empty {
        padding: 2rem;
        text-align: center;
        color: #6e7781;
      }
    `,
  ];
}
