import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Discussion } from "../../../model/discussion";
import { baseStyle } from "../../../style/base";

@customElement("discussion-info-presenter")
export class DiscussionInfoPresenter extends LitElement {
  @property({ attribute: false })
  discussion?: Discussion;

  render() {
    if (!this.discussion) return html``;

    return html`
      <section class="discussion-info">
        <div class="info-section">
          <h2>背景</h2>
          <p>${this.discussion.background}</p>
        </div>
        <div class="info-section">
          <h2>結論</h2>
          <p>${this.discussion.conclusion}</p>
        </div>
      </section>
    `;
  }

  static styles = [
    baseStyle,
    css`
      :host {
        display: block;
      }

      .discussion-info {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 32px;
        padding: 16px;
        background-color: var(--color-canvas-subtle);
        border-radius: 6px;
        border: 1px solid var(--color-border-default);
      }

      .info-section h2 {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-fg-muted);
        margin-bottom: 8px;
      }

      .info-section p {
        font-size: 14px;
        color: var(--color-fg-default);
        line-height: 1.6;
      }
    `,
  ];
}
