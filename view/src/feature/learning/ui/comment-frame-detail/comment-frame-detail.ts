import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import type { CommentFrame } from "../../model/comment-frame";
import "../comment-type-badge/comment-type-badge";

@customElement("learning-comment-frame-detail")
export class LearningCommentFrameDetail extends LitElement {
  @property({ type: Object })
  frame?: CommentFrame;

  render() {
    if (!this.frame) return html``;

    return html`
      <div class="container">
        <section>
          <h3>Types</h3>
          <div class="types">
            ${this.frame.types.map(
              (t) =>
                html`
                  <learning-comment-type-badge
                    .type=${t}
                  ></learning-comment-type-badge>
                `
            )}
          </div>
        </section>
        <section>
          <h3>Paths</h3>
          <div class="paths">
            ${this.frame.paths.map(
              (p) => html`
                <div class="path">
                  <learning-comment-type-badge
                    .type=${p.child}
                  ></learning-comment-type-badge>
                  <span class="material-symbols-outlined">arrow_forward</span>
                  <learning-comment-type-badge
                    .type=${p.parent}
                  ></learning-comment-type-badge>
                </div>
              `
            )}
          </div>
        </section>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    css`
      :host {
        display: block;
        padding: 16px;
        background-color: var(--color-bg-subtle);
        border-radius: 8px;
        border: 1px solid var(--color-border-default);
      }
      .container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      h3 {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: var(--color-fg-muted);
      }
      .types {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .paths {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .path {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .material-symbols-outlined {
        font-size: 18px;
        color: var(--color-fg-muted);
      }
    `,
  ];
}
