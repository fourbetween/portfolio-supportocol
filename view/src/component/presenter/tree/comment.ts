import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Comment, CommentType } from "../../../model/discussion";
import { baseStyle } from "../../../style/base";

interface CommentNode {
  comment: Comment;
  children: CommentNode[];
}

@customElement("comment-tree-presenter")
export class CommentTreePresenter extends LitElement {
  @property({ type: Array })
  comments: Comment[] = [];

  @property({ type: Array })
  commentTypes: CommentType[] = [];

  render() {
    const tree = this.buildTree(this.comments);
    return html`
      <div class="comment-tree">
        ${tree.map((node) => this.renderNode(node))}
      </div>
    `;
  }

  private buildTree(comments: Comment[]): CommentNode[] {
    const map = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    // Initialize nodes
    comments.forEach((c) => {
      map.set(c.id, { comment: c, children: [] });
    });

    // Build tree
    comments.forEach((c) => {
      const node = map.get(c.id)!;
      if (c.parentCommentId) {
        const parent = map.get(c.parentCommentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  private renderNode(node: CommentNode): TemplateResult {
    // Group children by comment type
    const childrenByType = new Map<string, CommentNode[]>();
    node.children.forEach((child) => {
      const typeId = child.comment.commentTypeId;
      if (!childrenByType.has(typeId)) {
        childrenByType.set(typeId, []);
      }
      childrenByType.get(typeId)!.push(child);
    });

    const commentType = this.commentTypes.find(
      (t) => t.id === node.comment.commentTypeId
    );

    return html`
      <div class="comment-node">
        <comment-treeitem-presenter
          .comment=${node.comment}
          .commentType=${commentType}
        ></comment-treeitem-presenter>
        ${Array.from(childrenByType.entries()).map(([typeId, children]) => {
          const type = this.commentTypes.find((t) => t.id === typeId);
          return html`
            <div class="comment-group">
              <div class="comment-group-label">${type?.name || "Unknown"}</div>
              ${children.map((child) => this.renderNode(child))}
            </div>
          `;
        })}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .comment-tree {
        margin-top: 24px;
      }

      .comment-group {
        margin-left: 20px;
        padding-left: 20px;
        border-left: 2px solid var(--color-border-muted);
        margin-top: 16px;
      }

      .comment-group-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--color-fg-muted);
        margin-bottom: 12px;
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .comment-group-label::before {
        content: "";
        position: absolute;
        left: -22px;
        width: 20px;
        height: 2px;
        background-color: var(--color-border-muted);
      }
    `,
  ];
}
