import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { baseStyle } from "../../../../shared/style/base";
import "../../../../shared/ui/comment-type-badge/comment-type-badge";
import type { Comment } from "../../model/comment";
import "../comment-card/comment-card";

@customElement("learning-proposed-comment-list")
export class LearningProposedCommentList extends LitElement {
  @property({ type: Array })
  comments: Comment[] = [];

  render() {
    if (this.comments.length === 0) {
      return html`
        <div class="empty">No proposed comments found.</div>
      `;
    }
    return html`
      <div class="list">
        ${repeat(
          this.comments,
          (comment) => comment.id,
          (comment) => this.renderComment(comment)
        )}
      </div>
    `;
  }

  private renderComment(comment: Comment) {
    return html`
      <div class="item">
        <div class="comment-container">
          <ui-comment-type-badge
            .type=${comment.commentType}
          ></ui-comment-type-badge>
          <learning-comment-card .comment=${comment}></learning-comment-card>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .empty {
        padding: 16px;
        text-align: center;
        color: var(--color-fg-muted);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-subtle);
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .item {
        display: flex;
        flex-direction: column;
        background-color: var(--color-canvas-default);
      }
      .comment-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    `,
  ];
}
