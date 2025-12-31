import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import type { Discussion } from "../../model/discussion";

@customElement("learning-discussion-list")
export class LearningDiscussionList extends LitElement {
  @property({ type: Array })
  discussions: Discussion[] = [];

  @property({ attribute: false })
  onSelect?: (discussion: Discussion) => void;

  render() {
    return html`
      <div class="list">
        ${this.discussions.map(
          (d) => html`
            <div class="item" @click=${() => this.onSelect?.(d)}>
              <span class="theme">${d.theme}</span>
            </div>
          `
        )}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .list {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        overflow: hidden;
      }
      .list:empty {
        border: none;
      }
      .item {
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
        font-weight: 600;
        color: var(--color-accent-fg);
      }
    `,
  ];
}
