import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { baseStyle } from "../../../shared/style/base";
import { listStyles } from "../../../shared/style/list";
import type { DiscussionSummary } from "../model/discussion";
import "./discussion-item";

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
          (d) => html`
            <learning-discussion-item .summary=${d}></learning-discussion-item>
          `,
        )}
      </div>
    `;
  }

  static styles = [baseStyle, listStyles, css``];
}
