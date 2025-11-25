import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Discussion } from "../../../model/discussion";
import type { Project } from "../../../model/project";
import { baseStyle } from "../../../style/base";
import { buttonStyle } from "../../../style/button";

@customElement("dashboard-page-presenter")
export class DashboardPagePresenter extends LitElement {
  @property({ attribute: false })
  projects: Project[] = [];

  @property({ attribute: false })
  recentDiscussions: Discussion[] = [];

  @property({ attribute: false })
  onCreateProject?: () => void;

  @property({ attribute: false })
  getProjectLink?: (id: string) => string;

  @property({ attribute: false })
  getDiscussionLink?: (id: string) => string;

  render() {
    return html`
      <main class="container">
        <h1>ダッシュボード</h1>
        <section class="section">
          <div class="section-header">
            <h2>プロジェクト</h2>
            <button class="btn-primary" @click=${this.handleCreateProject}>
              新規プロジェクト
            </button>
          </div>
          <ul class="project-list">
            ${this.projects.length === 0
              ? html`
                  <li class="empty-message">プロジェクトがありません</li>
                `
              : this.projects.map(
                  (project) => html`
                    <li class="project-item">
                      <a
                        class="project-link"
                        href=${this.getProjectLink?.(project.id) ?? "#"}
                      >
                        <span class="project-name">${project.name}</span>
                      </a>
                    </li>
                  `
                )}
          </ul>
        </section>
        <section class="section">
          <h2>最近の議論</h2>
          <ul class="discussion-list">
            ${this.recentDiscussions.length === 0
              ? html`
                  <li class="empty-message">最近の議論がありません</li>
                `
              : this.recentDiscussions.map(
                  (discussion) => html`
                    <li class="discussion-item">
                      <a
                        class="discussion-link"
                        href=${this.getDiscussionLink?.(discussion.id) ?? "#"}
                      >
                        <span class="discussion-theme">
                          ${discussion.theme}
                        </span>
                      </a>
                    </li>
                  `
                )}
          </ul>
        </section>
      </main>
    `;
  }

  private handleCreateProject() {
    this.onCreateProject?.();
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      :host {
        display: block;
        min-height: 100vh;
        background-color: var(--color-canvas-default);
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
      }

      h1 {
        font-size: 32px;
        font-weight: 700;
        color: var(--color-fg-default);
        margin: 0 0 24px 0;
      }

      .section {
        margin-bottom: 32px;
      }

      h2 {
        font-size: 20px;
        font-weight: 600;
        color: var(--color-fg-default);
        margin: 0;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .project-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .project-item {
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        margin-bottom: 8px;
        background-color: var(--color-canvas-default);
        transition: background-color 0.2s ease;
      }

      .project-item:hover {
        background-color: var(--color-canvas-subtle);
      }

      .project-link {
        display: block;
        padding: 12px 16px;
        text-decoration: none;
        color: inherit;
      }

      .project-name {
        font-size: 16px;
        font-weight: 500;
        color: var(--color-fg-default);
      }

      .empty-message {
        padding: 12px 16px;
        color: var(--color-fg-muted);
        font-size: 14px;
      }

      .discussion-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .discussion-item {
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        margin-bottom: 8px;
        background-color: var(--color-canvas-default);
        transition: background-color 0.2s ease;
      }

      .discussion-item:hover {
        background-color: var(--color-canvas-subtle);
      }

      .discussion-link {
        display: block;
        padding: 12px 16px;
        text-decoration: none;
        color: inherit;
      }

      .discussion-theme {
        font-size: 16px;
        font-weight: 500;
        color: var(--color-fg-default);
      }
    `,
  ];
}
