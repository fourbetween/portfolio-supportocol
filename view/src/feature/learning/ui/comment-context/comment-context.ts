import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { join } from "lit/directives/join.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import type { Comment } from "../../model/comment";
import "../comment-card/comment-card";
import "../comment-item/comment-item";
import "../comment-type-badge/comment-type-badge";

@customElement("learning-comment-context")
export class LearningCommentContext extends LitElement {
  @property({ type: Array })
  path: Comment[] = [];

  @property({ type: Object })
  childCounts = new Map<string, number>();

  @property({ type: Array })
  availableTypes: string[] = [];

  @property({ attribute: false })
  onCommentClick?: (comment: Comment) => void;

  @property({ attribute: false })
  onCommentUpdate?: (
    commentId: string,
    detail: { commentType: string; content: string }
  ) => void;

  @property({ attribute: false })
  onCommentDelete?: (commentId: string) => void;

  @property({ attribute: false })
  onCommentGenerate?: (commentId: string, commentType: string) => void;

  @property({ attribute: false })
  onCommentReply?: (
    parentCommentId: string,
    detail: { commentType: string; content: string }
  ) => void;

  private handleCommentClick(comment: Comment) {
    this.onCommentClick?.(comment);
  }

  render() {
    return html`
      <div class="container">
        ${join(
          this.path.map((comment, index) => {
            const isLast = index === this.path.length - 1;
            const childCount = this.childCounts.get(comment.id) || 0;
            if (isLast) {
              return html`
                <learning-comment-type-badge
                  .type=${comment.commentType}
                ></learning-comment-type-badge>
                <learning-comment-item
                  .comment=${comment}
                  .activeChildrenCount=${childCount}
                  .availableTypes=${this.availableTypes}
                  .onCommentClick=${this.onCommentClick}
                  .onCommentUpdate=${this.onCommentUpdate}
                  .onCommentDelete=${this.onCommentDelete}
                  .onCommentGenerate=${this.onCommentGenerate}
                  .onCommentReply=${this.onCommentReply}
                ></learning-comment-item>
              `;
            }
            return html`
              <learning-comment-type-badge
                .type=${comment.commentType}
              ></learning-comment-type-badge>
              <learning-comment-card
                .comment=${comment}
                .activeChildrenCount=${childCount}
                @click=${() => this.handleCommentClick(comment)}
              ></learning-comment-card>
            `;
          }),
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
