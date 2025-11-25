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
  onSelectProject?: (project: Project) => void;

  @property({ attribute: false })
  onSelectDiscussion?: (discussion: Discussion) => void;

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
                    <li
                      class="project-item"
                      @click=${() => this.handleSelectProject(project)}
                    >
                      <span class="project-name">${project.name}</span>
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
                    <li
                      class="discussion-item"
                      @click=${() => this.handleSelectDiscussion(discussion)}
                    >
                      <span class="discussion-theme">${discussion.theme}</span>
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

  private handleSelectProject(project: Project) {
    this.onSelectProject?.(project);
  }

  private handleSelectDiscussion(discussion: Discussion) {
    this.onSelectDiscussion?.(discussion);
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
        padding: 12px 16px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        margin-bottom: 8px;
        background-color: var(--color-canvas-default);
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .project-item:hover {
        background-color: var(--color-canvas-subtle);
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
        padding: 12px 16px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        margin-bottom: 8px;
        background-color: var(--color-canvas-default);
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .discussion-item:hover {
        background-color: var(--color-canvas-subtle);
      }

      .discussion-theme {
        font-size: 16px;
        font-weight: 500;
        color: var(--color-fg-default);
      }
    `,
  ];
}
