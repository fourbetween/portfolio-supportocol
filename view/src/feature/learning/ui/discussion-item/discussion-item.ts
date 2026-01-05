import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { hoverButtonStyle } from "../../../../shared/style/hover-button";
import { iconStyle } from "../../../../shared/style/icon";
import {
  RequestDeleteDiscussionEvent,
  SelectDiscussionEvent,
} from "../../event/discussion";
import type { Discussion } from "../../model/discussion";

@customElement("learning-discussion-item")
export class LearningDiscussionItem extends LitElement {
  @property({ type: Object })
  discussion!: Discussion;

  private handleSelect() {
    this.dispatchEvent(new SelectDiscussionEvent(this.discussion));
  }

  private handleDelete(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(new RequestDeleteDiscussionEvent(this.discussion));
  }

  render() {
    return html`
      <div class="item hover-container" @click=${this.handleSelect}>
        <span class="theme">${this.discussion.theme}</span>
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
