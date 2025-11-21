import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Project } from "../../../model/project";
import { baseStyle } from "../../../style/base";
import { buttonStyle } from "../../../style/button";

@customElement("project-list-presenter")
export class ProjectListPresenter extends LitElement {
  @property({ type: Array })
  projects: Project[] = [];

  render() {
    return html`
      <div class="sidebar-section">
        <div class="sidebar-heading">
          プロジェクト
          <a
            href="/view/sample/popup/project/create.html"
            class="btn btn-primary btn-sm"
          >
            新規
          </a>
        </div>
        <div class="card">
          <div class="card-body">
            <ul class="list-group">
              ${this.projects.map(
                (project) => html`
                  <li class="list-group-item">
                    <a
                      href="/view/sample/page/project/detail.html"
                      class="repo-name"
                    >
                      ${project.name}
                    </a>
                  </li>
                `
              )}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      .sidebar-section {
        margin-bottom: 24px;
      }

      .sidebar-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: 14px;
      }

      .card {
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
      }

      .list-group {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .list-group-item {
        border-top: 1px solid var(--color-border-muted);
        padding: 16px;
      }

      .list-group-item:first-child {
        border-top: none;
      }

      .repo-name {
        font-weight: 600;
        color: var(--color-accent-fg);
        text-decoration: none;
        font-size: 14px;
      }

      .repo-name:hover {
        text-decoration: underline;
      }
    `,
  ];
}
