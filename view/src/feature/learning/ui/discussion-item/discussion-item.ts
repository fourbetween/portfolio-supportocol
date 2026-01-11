import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { hoverButtonStyle } from "../../../../shared/style/hover-button";
import { iconStyle } from "../../../../shared/style/icon";
import {
  LearningDiscussionDeleteEvent,
  LearningDiscussionSelectEvent,
} from "../../event/discussion";
import type { Discussion } from "../../model/discussion";
import "../discussion-status-badge/discussion-status-badge";

@customElement("learning-discussion-item")
export class LearningDiscussionItem extends LitElement {
  @property({ type: Object })
  discussion!: Discussion;

  private handleSelect() {
    this.dispatchEvent(new LearningDiscussionSelectEvent(this.discussion));
  }

  private handleDelete(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(new LearningDiscussionDeleteEvent(this.discussion));
  }

  render() {
    const { theme, status } = this.discussion;
    return html`
      <div class="item hover-container" @click=${this.handleSelect}>
        <div class="info">
          <span class="theme">${theme}</span>
        </div>
        <learning-discussion-status-badge
          class="status-badge"
          .status=${status}
        ></learning-discussion-status-badge>
        <button
          class="btn-hover danger delete-button"
          aria-label="delete"
          @click=${this.handleDelete}
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
      .item {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background-color: var(--color-canvas-default);
        cursor: pointer;
        border-radius: var(--item-border-top-left-radius, 0)
          var(--item-border-top-right-radius, 0)
          var(--item-border-bottom-right-radius, 0)
          var(--item-border-bottom-left-radius, 0);
      }
      .item:hover {
        background-color: var(--color-canvas-subtle);
      }
      .info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        flex: 1;
      }
      .theme {
        font-size: 0.9rem;
        color: var(--color-accent-fg);
      }
      .status-badge {
        position: absolute;
        bottom: 8px;
        right: 8px;
      }
      .delete-button {
        right: 0;
        top: 50%;
        transform: translate(50%, -50%);
      }
    `,
  ];
}
