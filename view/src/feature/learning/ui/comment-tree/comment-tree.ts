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

  @property({ attribute: false })
  onCommentGenerate?: (commentId: string, commentType: string) => void;

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

    const groupedRoots = this.groupCommentsByType(this.rootComments);

    return html`
      <div class="tree">
        ${Object.entries(groupedRoots).map(([type, typeRoots]) =>
          this.renderGroup(type, typeRoots)
        )}
      </div>
    `;
  }

  private renderComment(comment: Comment): any {
    const children = this.childrenMap.get(comment.id) || [];
    const groupedChildren = this.groupCommentsByType(children);

    return html`
      <div class="comment-node">
        <learning-comment-item
          .comment=${comment}
          .availableTypes=${this.availableTypes}
          .onCommentClick=${this.onCommentClick}
          .onCommentUpdate=${this.onCommentUpdate}
          .onCommentDelete=${this.onCommentDelete}
          .onCommentGenerate=${this.onCommentGenerate}
        ></learning-comment-item>
        <div class="children">
          ${Object.entries(groupedChildren).map(([type, typeChildren]) =>
            this.renderGroup(type, typeChildren)
          )}
        </div>
      </div>
    `;
  }

  private renderGroup(type: string, comments: Comment[]) {
    return html`
      <div class="child-group">
        <learning-comment-type-badge
          .type=${type}
        ></learning-comment-type-badge>
        <div class="group-content">
          ${comments.map((comment) => this.renderComment(comment))}
        </div>
      </div>
    `;
  }

  private groupCommentsByType(comments: Comment[]): Record<string, Comment[]> {
    return comments.reduce((acc, comment) => {
      if (!acc[comment.commentType]) {
        acc[comment.commentType] = [];
      }
      acc[comment.commentType].push(comment);
      return acc;
    }, {} as Record<string, Comment[]>);
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
