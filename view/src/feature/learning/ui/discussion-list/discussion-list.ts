import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import type { Discussion } from "../../model/discussion";

@customElement("learning-discussion-list")
export class LearningDiscussionList extends LitElement {
  @property({ type: Array })
  discussions: Discussion[] = [];

  @property({ attribute: false })
  onSelect?: (discussion: Discussion) => void;

  @property({ attribute: false })
  onDelete?: (discussion: Discussion) => void;

  render() {
    if (this.discussions.length === 0) {
      return html`
        <div class="empty">No discussions found.</div>
      `;
    }
    return html`
      <div class="list">
        ${this.discussions.map(
          (d) => html`
            <div class="item" @click=${() => this.onSelect?.(d)}>
              <span class="theme">${d.theme}</span>
              <button
                class="delete-button"
                aria-label="delete"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  this.onDelete?.(d);
                }}
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          `
        )}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    css`
      .empty {
        padding: 16px;
        text-align: center;
        color: var(--color-fg-muted);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-subtle);
      }
      .list {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
      }
      .item {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        padding-right: 48px;
        border-bottom: 1px solid var(--color-border-muted);
        background-color: var(--color-canvas-default);
        cursor: pointer;
      }
      .item:first-child {
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
      }
      .item:last-child {
        border-bottom: none;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
      }
      .item:hover {
        background-color: var(--color-canvas-subtle);
      }
      .theme {
        font-size: 0.9rem;
        color: var(--color-accent-fg);
      }
      .delete-button {
        position: absolute;
        right: -16px;
        top: 50%;
        transform: translateY(-50%);
        background: var(--color-canvas-default);
        color: var(--color-fg-muted);
        border: 1px solid var(--color-border-default);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: all 0.1s;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        z-index: 1;
      }
      .item:hover .delete-button {
        opacity: 1;
      }
      .delete-button:hover {
        color: var(--color-danger-fg);
      }
    `,
  ];
}
