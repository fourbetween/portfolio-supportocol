import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { baseStyle } from "../../../../shared/style/base";
import type { Discussion } from "../../model/discussion";
import "../discussion-item/discussion-item";

@customElement("learning-discussion-list")
export class LearningDiscussionList extends LitElement {
  @property({ type: Array })
  discussions: Discussion[] = [];

  render() {
    if (this.discussions.length === 0) {
      return html`
        <div class="empty">No discussions found.</div>
      `;
    }
    return html`
      <div class="list">
        ${repeat(
          this.discussions,
          (d) => d.id,
          (d) =>
            html`
              <learning-discussion-item
                .discussion=${d}
              ></learning-discussion-item>
            `
        )}
      </div>
    `;
  }

  static styles = [
    baseStyle,
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
      learning-discussion-item {
        border-bottom: 1px solid var(--color-border-muted);
      }
      learning-discussion-item:last-child {
        border-bottom: none;
      }
    `,
  ];
}
