import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { DialogueDiscussionSelectEvent } from "../../event/discussion";
import type { DiscussionSummary } from "../../model/discussion";

@customElement("dialogue-discussion-item")
export class DialogueDiscussionItem extends LitElement {
  @property({ type: Object })
  summary!: DiscussionSummary;

  private handleClick() {
    this.dispatchEvent(new DialogueDiscussionSelectEvent(this.summary.id));
  }

  render() {
    return html`
      <div class="item hover-container" @click=${this.handleClick}>
        <span class="theme">${this.summary.theme}</span>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .item {
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
      .theme {
        font-size: 0.9rem;
        color: var(--color-accent-fg);
      }
    `,
  ];
}
