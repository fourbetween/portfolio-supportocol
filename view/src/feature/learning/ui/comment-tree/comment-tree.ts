import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import type { Comment } from "../../model/comment";
import "../comment-card/comment-card";
import "../comment-type-badge/comment-type-badge";

@customElement("learning-comment-tree")
export class LearningCommentTree extends LitElement {
  @property({ type: Array })
  comments?: Comment[];

  @property({ attribute: false })
  onCommentClick?: (comment: Comment) => void;

  render() {
    if (!this.comments) return html``;

    const commentIds = new Set(this.comments.map((c) => c.id));
    const rootComments = this.comments.filter(
      (c) => !c.parentCommentId || !commentIds.has(c.parentCommentId)
    );

    return html`
      <div class="tree">
        ${rootComments.map((comment) => this.renderComment(comment, 0))}
      </div>
    `;
  }

  private renderComment(comment: Comment, depth: number): any {
    const children =
      this.comments?.filter((c) => c.parentCommentId === comment.id) || [];
    const groupedChildren = children.reduce((acc, child) => {
      if (!acc[child.commentType]) {
        acc[child.commentType] = [];
      }
      acc[child.commentType].push(child);
      return acc;
    }, {} as Record<string, Comment[]>);

    return html`
      <div class="comment-node">
        <learning-comment-card
          .comment=${comment}
          @click=${() => this.handleCommentClick(comment)}
          style="cursor: pointer;"
        ></learning-comment-card>
        <div class="children">
          ${Object.entries(groupedChildren).map(
            ([type, typeChildren]) => html`
              <div class="child-group">
                <learning-comment-type-badge
                  .type=${type}
                ></learning-comment-type-badge>
                ${typeChildren.map((child) =>
                  this.renderComment(child, depth + 1)
                )}
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private handleCommentClick(comment: Comment) {
    if (this.onCommentClick) {
      this.onCommentClick(comment);
    }
  }

  static styles = [
    baseStyle,
    iconStyle,
    css`
      .comment-node {
        margin-bottom: 16px;
      }
      .children {
        margin-left: 24px;
      }
      .child-group {
        margin-top: 8px;
      }
    `,
  ];
}
