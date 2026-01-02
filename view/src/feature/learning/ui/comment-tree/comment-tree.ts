import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import type { Comment } from "../../model/comment";
import { deriveCommentFrame } from "../../model/comment-frame";
import "../comment-item/comment-item";
import "../comment-type-badge/comment-type-badge";

@customElement("learning-comment-tree")
export class LearningCommentTree extends LitElement {
  @property({ type: Array })
  comments?: Comment[];

  @property({ attribute: false })
  onCommentClick?: (comment: Comment) => void;

  @property({ attribute: false })
  onCommentUpdate?: (
    commentId: string,
    detail: { commentType: string; content: string }
  ) => void;

  @property({ attribute: false })
  onCommentDelete?: (commentId: string) => void;

  private rootComments: Comment[] = [];
  private childrenMap = new Map<string, Comment[]>();
  private availableTypes: string[] = [];

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("comments")) {
      this.childrenMap.clear();
      this.rootComments = [];
      this.availableTypes = [];

      if (this.comments) {
        this.availableTypes = deriveCommentFrame(this.comments).types;
        const commentIds = new Set(this.comments.map((c) => c.id));
        for (const comment of this.comments) {
          if (comment.parentCommentId) {
            const children =
              this.childrenMap.get(comment.parentCommentId) || [];
            children.push(comment);
            this.childrenMap.set(comment.parentCommentId, children);
          }

          if (
            !comment.parentCommentId ||
            !commentIds.has(comment.parentCommentId)
          ) {
            this.rootComments.push(comment);
          }
        }
      }
    }
  }

  render() {
    if (!this.comments) return html``;

    const groupedRoots = this.rootComments.reduce((acc, root) => {
      if (!acc[root.commentType]) {
        acc[root.commentType] = [];
      }
      acc[root.commentType].push(root);
      return acc;
    }, {} as Record<string, Comment[]>);

    return html`
      <div class="tree">
        ${Object.entries(groupedRoots).map(
          ([type, typeRoots]) => html`
            <div class="child-group">
              <learning-comment-type-badge
                .type=${type}
              ></learning-comment-type-badge>
              <div class="group-content">
                ${typeRoots.map((root) => this.renderComment(root, 0))}
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  private renderComment(comment: Comment, depth: number): any {
    const children = this.childrenMap.get(comment.id) || [];
    const groupedChildren = children.reduce((acc, child) => {
      if (!acc[child.commentType]) {
        acc[child.commentType] = [];
      }
      acc[child.commentType].push(child);
      return acc;
    }, {} as Record<string, Comment[]>);

    return html`
      <div class="comment-node">
        <learning-comment-item
          .comment=${comment}
          .availableTypes=${this.availableTypes}
          .onCommentClick=${this.onCommentClick}
          .onCommentUpdate=${this.onCommentUpdate}
          .onCommentDelete=${this.onCommentDelete}
        ></learning-comment-item>
        <div class="children">
          ${Object.entries(groupedChildren).map(
            ([type, typeChildren]) => html`
              <div class="child-group">
                <learning-comment-type-badge
                  .type=${type}
                ></learning-comment-type-badge>
                <div class="group-content">
                  ${typeChildren.map((child) =>
                    this.renderComment(child, depth + 1)
                  )}
                </div>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    css`
      .comment-node {
        margin-bottom: 16px;
      }
      .children {
        margin-left: 8px;
      }
      .child-group {
        margin-top: 12px;
        margin-bottom: 12px;
      }
      .group-content {
        margin-left: 8px;
        padding-left: 8px;
        border-left: 1px dashed var(--color-border-muted);
        margin-top: 8px;
      }
    `,
  ];
}
