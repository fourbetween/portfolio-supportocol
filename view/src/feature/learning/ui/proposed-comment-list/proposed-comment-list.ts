import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { baseStyle } from "../../../../shared/style/base";
import { CommentSelectEvent } from "../../event/comment";
import type { Comment } from "../../model/comment";
import "../comment-card/comment-card";
import "../comment-type-badge/comment-type-badge";

@customElement("learning-proposed-comment-list")
export class LearningProposedCommentList extends LitElement {
  @property({ type: Array })
  comments: Comment[] = [];

  private onSelect(comment: Comment) {
    this.dispatchEvent(new CommentSelectEvent(comment.id));
  }

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
          <learning-comment-type-badge
            .type=${comment.commentType}
          ></learning-comment-type-badge>
          <learning-comment-card
            class="clickable"
            .comment=${comment}
            @click=${() => this.onSelect(comment)}
          ></learning-comment-card>
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
      .clickable {
        cursor: pointer;
      }
      .clickable:hover {
        opacity: 0.8;
      }
    `,
  ];
}
