import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { Project } from "../../../model/project";
import { baseStyle } from "../../../style/base";
import { buttonStyle } from "../../../style/button";
import { cardStyle } from "../../../style/card";
import type { CreateProjectPopupPresenter } from "../popup/project/create";

@customElement("project-list-presenter")
export class ProjectListPresenter extends LitElement {
  @property({ type: Array })
  projects: Project[] = [];

  @property({ attribute: false })
  onCreate: (name: string) => Promise<void> = () => Promise.resolve();

  @query("create-project-popup-presenter")
  private createProjectPopup!: CreateProjectPopupPresenter;

  render() {
    return html`
      <div class="sidebar-section">
        <div class="sidebar-heading">
          プロジェクト
          <button
            class="btn btn-primary btn-sm"
            @click=${() => this.createProjectPopup.open()}
          >
            新規
          </button>
        </div>
        <div class="card">
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
      <create-project-popup-presenter
        .onCreate=${this.onCreate}
      ></create-project-popup-presenter>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    cardStyle,
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
