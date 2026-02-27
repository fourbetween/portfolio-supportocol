import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { baseStyle } from "../../../shared/style/base";
import { emptyStyle } from "../../../shared/style/list";
import "../../../shared/ui/comment-type-badge/comment-type-badge";
import type { Comment } from "../model/comment";
import "./comment-card";

@customElement("learning-proposed-comment-list")
export class LearningProposedCommentList extends LitElement {
  @property({ type: Array })
  comments: Comment[] = [];

  render() {
    if (this.comments.length === 0) {
      return html`
        <div class="empty">${msg("No proposed comments found.")}</div>
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
      <div class="item">
        <div class="comment-container">
          <ui-comment-type-badge .type=${comment.type}></ui-comment-type-badge>
          <learning-comment-card
            .comment=${comment}
            .clickable=${true}
          ></learning-comment-card>
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
      }
      .comment-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
    `,
  ];
}
