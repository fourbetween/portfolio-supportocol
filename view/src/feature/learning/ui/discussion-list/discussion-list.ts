import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { baseStyle } from "../../../../shared/style/base";
import type { DiscussionSummary } from "../../model/discussion";
import "../discussion-item/discussion-item";

@customElement("learning-discussion-list")
export class LearningDiscussionList extends LitElement {
  @property({ type: Array })
  summaries: DiscussionSummary[] = [];

  render() {
    if (this.summaries.length === 0) {
      return html`
        <div class="empty">No discussions found.</div>
      `;
    }
    return html`
      <div class="list">
        ${repeat(
          this.summaries,
          (d) => d.id,
          (d) =>
            html`
              <learning-discussion-item
                .summary=${d}
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
      }
      learning-discussion-item {
        border-bottom: 1px solid var(--color-border-muted);
      }
      learning-discussion-item:first-child {
        --item-border-top-left-radius: 6px;
        --item-border-top-right-radius: 6px;
      }
      learning-discussion-item:last-child {
        border-bottom: none;
        --item-border-bottom-left-radius: 6px;
        --item-border-bottom-right-radius: 6px;
      }
    `,
  ];
}
