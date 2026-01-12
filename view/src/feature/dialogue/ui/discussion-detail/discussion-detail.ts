import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
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
        <h1 class="theme">${this.discussion?.theme}</h1>
      </div>
    `;
  }

  static styles = [
    baseStyle,
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
    `,
  ];
}
