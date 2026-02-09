import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { discussionDetailStyle } from "../../../shared/style/discussion-detail";
import { titleStyle } from "../../../shared/style/title";
import "../../../shared/ui/discussion-archive-badge/discussion-archive-badge";
import type { Discussion } from "../model/discussion";

@customElement("dialogue-discussion-detail")
export class DialogueDiscussionDetail extends LitElement {
  @property({ type: Object })
  discussion?: Discussion;

  render() {
    if (!this.discussion) {
      return html``;
    }

    return html`
      <div class="container">
        <div class="badge-row">
          <ui-discussion-archive-badge
            .archived=${!!this.discussion?.archivedAt}
          ></ui-discussion-archive-badge>
        </div>
        <div class="theme-row">
          <div class="section-title">${msg("Theme")}</div>
          <h1 class="theme">${this.discussion?.theme}</h1>
        </div>
        ${this.discussion?.premise
          ? html`
              <div class="premise-row">
                <div class="section-title">${msg("Premise")}</div>
                <p class="premise">${this.discussion.premise}</p>
              </div>
            `
          : html``}
        ${this.discussion?.conclusion
          ? html`
              <div class="conclusion-row">
                <div class="section-title">${msg("Conclusion")}</div>
                <p class="conclusion">${this.discussion.conclusion}</p>
              </div>
            `
          : html``}
      </div>
    `;
  }

  static styles = [baseStyle, titleStyle, discussionDetailStyle, css``];
}
