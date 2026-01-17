import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { titleStyle } from "../../../../shared/style/title";
import type { Discussion } from "../../model/discussion";

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
        <div class="theme-row">
          <div class="section-title">Theme</div>
          <h1 class="theme">${this.discussion?.theme}</h1>
        </div>
        ${this.discussion?.conclusion
          ? html`
              <div class="conclusion-row">
                <div class="section-title">Conclusion</div>
                <p class="conclusion">${this.discussion.conclusion}</p>
              </div>
            `
          : html``}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    titleStyle,
    css`
      .container {
        padding: 8px 0;
        background-color: var(--color-canvas-default);
      }

      .theme {
        font-size: 16px;
        font-weight: 400;
        margin: 0;
      }

      .conclusion-row {
        margin-top: 8px;
        padding-top: 8px;
      }

      .conclusion {
        font-size: 14px;
        margin: 0;
        white-space: pre-wrap;
        padding-bottom: 8px;
      }
    `,
  ];
}
