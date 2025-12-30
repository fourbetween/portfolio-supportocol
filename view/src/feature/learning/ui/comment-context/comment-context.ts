import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import type { Comment } from "../../model/comment";
import "../comment-card/comment-card";

@customElement("learning-comment-context")
export class LearningCommentContext extends LitElement {
  @property({ type: Array })
  ancestors: Comment[] = [];

  render() {
    return html`
      <div class="container">
        ${this.ancestors.map(
          (comment, index) => html`
            <learning-comment-card .comment=${comment}></learning-comment-card>
            ${index < this.ancestors.length - 1
              ? html`
                  <div class="separator">
                    <span class="material-symbols-outlined">south</span>
                  </div>
                `
              : ""}
          `
        )}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    css`
      :host {
        display: block;
      }
      .container {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .separator {
        display: flex;
        justify-content: center;
        color: var(--color-fg-muted);
        margin: 4px 0;
      }
      .material-symbols-outlined {
        font-size: 20px;
      }
    `,
  ];
}
