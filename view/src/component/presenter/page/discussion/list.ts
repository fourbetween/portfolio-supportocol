import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Discussion } from "../../../../model/discussion";
import { baseStyle } from "../../../../style/base";

@customElement("list-discussion-page-presenter")
export class ListDiscussionPagePresenter extends LitElement {
  @property({ attribute: false })
  discussions: Discussion[] = [];

  @property({ attribute: false })
  getDiscussionLink?: (id: string) => string;

  @property({ attribute: false })
  onSearch?: (query: string) => void;

  private handleSearch(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    this.onSearch?.(target.value);
  }

  render() {
    return html`
      <main class="container">
        <h1>議論一覧</h1>
        <div class="search-section">
          <input
            type="text"
            class="search-input"
            placeholder="議論を検索..."
            @input=${this.handleSearch}
          />
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
                      <span class="discussion-theme">${discussion.theme}</span>
                    </a>
                  </li>
                `
              )}
        </ul>
      </main>
    `;
  }

  static styles = [
    baseStyle,
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

      .search-section {
        margin-bottom: 16px;
      }

      .search-input {
        width: 100%;
        max-width: 400px;
        padding: 8px 12px;
        font-size: 14px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
        color: var(--color-fg-default);
      }

      .search-input:focus {
        outline: none;
        border-color: var(--color-accent-fg);
        box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.3);
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
    `,
  ];
}
