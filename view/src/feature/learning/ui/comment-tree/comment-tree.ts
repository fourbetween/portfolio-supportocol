import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import type { Comment } from "../../model/comment";
import { deriveCommentFrame } from "../../model/comment-frame";
import "../comment-card/comment-card";
import "../comment-edit-form/comment-edit-form";
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

  @state()
  private editingCommentId: string | null = null;

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
    if (this.editingCommentId === comment.id) {
      return html`
        <div class="comment-node">
          <learning-comment-edit-form
            .initialType=${comment.commentType}
            .initialContent=${comment.content}
            .availableTypes=${this.availableTypes}
            .onCancel=${() => (this.editingCommentId = null)}
            .onSave=${(detail: { commentType: string; content: string }) => {
              if (this.onCommentUpdate) {
                this.onCommentUpdate(comment.id, detail);
              }
              this.editingCommentId = null;
            }}
          ></learning-comment-edit-form>
        </div>
      `;
    }

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
        <div class="card-container">
          <learning-comment-card
            .comment=${comment}
            @click=${() => this.handleCommentClick(comment)}
            style="cursor: pointer;"
          ></learning-comment-card>
          <button
            class="edit-button material-symbols-outlined"
            @click=${(e: Event) => {
              e.stopPropagation();
              this.editingCommentId = comment.id;
            }}
            aria-label="edit"
          >
            edit
          </button>
        </div>
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
      .card-container {
        position: relative;
      }
      .edit-button {
        position: absolute;
        bottom: -16px;
        left: 8px;
        background: var(--color-canvas-default);
        color: var(--color-fg-muted);
        border: 1px solid var(--color-border-default);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        z-index: 1;
      }
      .card-container:hover .edit-button {
        opacity: 1;
      }
      .edit-button:hover {
        background: var(--color-canvas-subtle);
        color: var(--color-accent-fg);
        border-color: var(--color-accent-fg);
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
