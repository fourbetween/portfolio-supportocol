import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { baseStyle } from "../../../shared/style/base";
import { emptyStyle } from "../../../shared/style/list";
import "../../../shared/ui/comment-type-badge/comment-type-badge";
import { LearningCommentSelectEvent } from "../event/comment";
import type { Comment } from "../model/comment";
import "./comment-card";
import "./issue-list";

@customElement("learning-issue-comment-list")
export class LearningIssueCommentList extends LitElement {
  @property({ type: Array })
  comments: Comment[] = [];

  private _handleSelect(commentId: string) {
    this.dispatchEvent(new LearningCommentSelectEvent(commentId));
  }

  render() {
    if (this.comments.length === 0) {
      return html`
        <div class="empty">No comments with issues found.</div>
      `;
    }
    return html`
      <div class="list">
        ${repeat(
          this.comments,
          (comment) => comment.id,
          (comment) => this.renderComment(comment),
        )}
      </div>
    `;
  }

  private renderComment(comment: Comment) {
    return html`
      <div class="item" @click=${() => this._handleSelect(comment.id)}>
        <div class="comment-container">
          <ui-comment-type-badge .type=${comment.type}></ui-comment-type-badge>
          <learning-comment-card
            .comment=${comment}
            readonly
          ></learning-comment-card>
          <div class="issue-container">
            <learning-issue-list
              .commentId=${comment.id}
              .issues=${comment.issues}
              readonly
            ></learning-issue-list>
          </div>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    emptyStyle,
    css`
      .list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .item {
        display: flex;
        flex-direction: column;
        background-color: var(--color-canvas-default);
        cursor: pointer;
        padding: 8px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        transition: background-color 0.2s;
      }
      .item:hover {
        background-color: var(--color-canvas-subtle);
      }
      .comment-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .issue-container {
        margin-top: 4px;
      }
    `,
  ];
}
