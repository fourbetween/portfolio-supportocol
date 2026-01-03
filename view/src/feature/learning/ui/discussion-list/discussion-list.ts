import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { hoverButtonStyle } from "../../../../shared/style/hover-button";
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
        ${this.discussions.map((d) => this.renderDiscussion(d))}
      </div>
    `;
  }

  private renderDiscussion(d: Discussion) {
    return html`
      <div class="item hover-container" @click=${() => this.onSelect?.(d)}>
        <span class="theme">${d.theme}</span>
        <button
          class="btn-hover danger delete-button"
          aria-label="delete"
          @click=${(e: Event) => {
            e.stopPropagation();
            this.onDelete?.(d);
          }}
        >
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    hoverButtonStyle,
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
        right: -16px;
        top: 50%;
        transform: translateY(-50%);
      }
    `,
  ];
}
