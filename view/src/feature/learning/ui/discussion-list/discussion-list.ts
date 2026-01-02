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
        overflow: hidden;
      }
      .item {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid var(--color-border-muted);
        background-color: var(--color-canvas-default);
        cursor: pointer;
      }
      .item:last-child {
        border-bottom: none;
      }
      .item:hover {
        background-color: var(--color-canvas-subtle);
      }
      .theme {
        color: var(--color-accent-fg);
      }
      .delete-button {
        display: none;
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        padding: 4px;
        border: none;
        background: none;
        color: var(--color-fg-muted);
        cursor: pointer;
        border-radius: 4px;
      }
      .item:hover .delete-button {
        display: flex;
      }
      .delete-button:hover {
        background-color: var(--color-neutral-muted);
        color: var(--color-danger-fg);
      }
    `,
  ];
}
