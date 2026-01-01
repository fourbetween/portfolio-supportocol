import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import type { Comment } from "../../model/comment";
import "../comment-card/comment-card";
import "../comment-type-badge/comment-type-badge";

@customElement("learning-comment-context")
export class LearningCommentContext extends LitElement {
  @property({ type: Array })
  ancestors: Comment[] = [];

  @property({ attribute: false })
  onCommentClick?: (comment: Comment) => void;

  private handleCommentClick(comment: Comment) {
    if (this.onCommentClick) {
      this.onCommentClick(comment);
    }
  }

  render() {
    return html`
      <div class="container">
        ${this.ancestors.map(
          (comment, index) => html`
            <learning-comment-type-badge
              .type=${comment.commentType}
            ></learning-comment-type-badge>
            <learning-comment-card
              .comment=${comment}
              @click=${() => this.handleCommentClick(comment)}
            ></learning-comment-card>
            ${index < this.ancestors.length - 1
              ? html`
                  <div class="separator">
                    <span class="material-symbols-outlined">north</span>
                  </div>
                `
              : nothing}
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
