import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { join } from "lit/directives/join.js";
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
    this.onCommentClick?.(comment);
  }

  render() {
    return html`
      <div class="container">
        ${join(
          this.ancestors.map(
            (comment) => html`
              <learning-comment-type-badge
                .type=${comment.commentType}
              ></learning-comment-type-badge>
              <learning-comment-card
                .comment=${comment}
                @click=${() => this.handleCommentClick(comment)}
              ></learning-comment-card>
            `
          ),
          html`
            <div class="separator">
              <span class="material-symbols-outlined">north</span>
            </div>
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
      learning-comment-card {
        cursor: pointer;
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
