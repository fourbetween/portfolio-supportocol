import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Discussion } from "../../../../model/discussion";
import type { Project } from "../../../../model/project";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";

@customElement("item-project-page-presenter")
export class ItemProjectPagePresenter extends LitElement {
  @property({ attribute: false })
  project?: Project;

  @property({ attribute: false })
  discussions: Discussion[] = [];

  @property({ attribute: false })
  getDiscussionLink?: (id: string) => string;

  @property({ attribute: false })
  onCreateDiscussion?: () => void;

  @property({ attribute: false })
  onEditProject?: () => void;

  @property({ attribute: false })
  onDeleteProject?: () => void;

  private handleCreateDiscussion() {
    this.onCreateDiscussion?.();
  }

  private handleEditProject() {
    this.onEditProject?.();
  }

  private handleDeleteProject() {
    this.onDeleteProject?.();
  }

  render() {
    return html`
      <main class="container">
        <header class="page-header">
          <h1>${this.project?.name ?? ""}</h1>
          <div class="header-actions">
            <button class="btn-secondary" @click=${this.handleEditProject}>
              編集
            </button>
            <button class="btn-danger" @click=${this.handleDeleteProject}>
              削除
            </button>
          </div>
        </header>
        <section class="section">
          <div class="section-header">
            <h2>議論</h2>
            <button class="btn-primary" @click=${this.handleCreateDiscussion}>
              新規議論
            </button>
          </div>
          <ul class="discussion-list">
            ${this.discussions.length === 0
              ? html`
                  <li class="empty-message">議論がありません</li>
                `
              : this.discussions.map(
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
        margin: 0;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .header-actions {
        display: flex;
        gap: 8px;
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

      .empty-message {
        padding: 12px 16px;
        color: var(--color-fg-muted);
        font-size: 14px;
      }

      .btn-danger {
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-danger-fg);
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .btn-danger:hover {
        color: var(--color-btn-primary-text);
        background-color: var(--color-danger-fg);
        border-color: var(--color-danger-fg);
      }
    `,
  ];
}
