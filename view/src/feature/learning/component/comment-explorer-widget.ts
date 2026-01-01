import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { iconStyle } from "../../../shared/style/icon";
import { titleStyle } from "../../../shared/style/title";
import { client } from "../api/client";
import type { Comment } from "../model/comment";
import "../ui/comment-context/comment-context";
import "../ui/comment-tree/comment-tree";
import "./comment-create-widget";

@customElement("learning-comment-explorer-widget")
export class LearningCommentExplorerWidget extends LitElement {
  @property({ type: String })
  discussionId?: string;

  @property({ type: Array })
  comments?: Comment[];

  @state()
  private selectedCommentId?: string;

  private commentMap = new Map<string, Comment>();
  private childrenMap = new Map<string, Comment[]>();

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("comments")) {
      this.commentMap.clear();
      this.childrenMap.clear();

      if (this.comments) {
        for (const comment of this.comments) {
          this.commentMap.set(comment.id, comment);
          if (comment.parentCommentId) {
            const children =
              this.childrenMap.get(comment.parentCommentId) || [];
            children.push(comment);
            this.childrenMap.set(comment.parentCommentId, children);
          }
        }
      }
    }
  }

  private handleCommentClick(comment: Comment) {
    this.selectedCommentId =
      this.selectedCommentId === comment.id ? undefined : comment.id;
  }

  private async handleCommentUpdate(
    commentId: string,
    detail: { commentType: string; content: string }
  ) {
    if (!this.discussionId) return;
    const { data, error } = await client.PUT(
      "/learning/discussions/{discussionId}/comments/{commentId}",
      {
        params: {
          path: {
            discussionId: this.discussionId,
            commentId,
          },
        },
        body: detail,
      }
    );

    if (error) {
      showToast(this, error.message, "error");
      return;
    }

    showToast(this, "Comment updated.", "success", 2000);
    this.dispatchEvent(
      new CustomEvent("comment-updated", {
        detail: data,
      })
    );
  }

  private getAncestors(selectedId: string): Comment[] {
    const ancestors: Comment[] = [];
    let currentId: string | null = selectedId;

    while (currentId) {
      const comment = this.commentMap.get(currentId);
      if (!comment) break;
      ancestors.unshift(comment);
      currentId = comment.parentCommentId;
    }

    return ancestors;
  }

  private getDescendants(selectedId: string): Comment[] {
    const descendants: Comment[] = [];
    const queue = [selectedId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const children = this.childrenMap.get(currentId) || [];
      descendants.push(...children);
      queue.push(...children.map((c) => c.id));
    }

    return descendants;
  }

  render() {
    const ancestors = this.selectedCommentId
      ? this.getAncestors(this.selectedCommentId)
      : [];
    const descendants = this.selectedCommentId
      ? this.getDescendants(this.selectedCommentId)
      : this.comments || [];

    return html`
      <div class="container">
        ${ancestors.length > 0
          ? html`
              <div class="section">
                <div class="section-header">
                  <div class="section-title">Context</div>
                  <button
                    class="clear-button"
                    @click=${() => (this.selectedCommentId = undefined)}
                  >
                    <span class="material-symbols-outlined">close</span>
                    <span>Clear Selection</span>
                  </button>
                </div>
                <learning-comment-context
                  .ancestors=${ancestors}
                  .onCommentClick=${(c: Comment) => this.handleCommentClick(c)}
                ></learning-comment-context>
              </div>
            `
          : nothing}
        <learning-comment-create-widget
          .discussionId=${this.discussionId}
          .parentCommentId=${this.selectedCommentId}
          .comments=${this.comments}
        ></learning-comment-create-widget>
        <div class="section">
          <div class="section-title">
            ${this.selectedCommentId ? "Replies" : "All Comments"}
          </div>
          <learning-comment-tree
            .comments=${descendants}
            .onCommentClick=${(c: Comment) => this.handleCommentClick(c)}
            .onCommentUpdate=${(
              id: string,
              detail: { commentType: string; content: string }
            ) => this.handleCommentUpdate(id, detail)}
          ></learning-comment-tree>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    titleStyle,
    css`
      :host {
        display: block;
      }
      .container {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .section-header .section-title {
        margin-bottom: 0;
      }
      .clear-button {
        background: none;
        border: none;
        padding: 4px 8px;
        cursor: pointer;
        color: var(--color-fg-muted);
        display: flex;
        align-items: center;
        gap: 4px;
        border-radius: 4px;
        font-size: 12px;
      }
      .clear-button:hover {
        background-color: var(--color-canvas-subtle);
        color: var(--color-fg-default);
      }
      .clear-button .material-symbols-outlined {
        font-size: 16px;
      }
    `,
  ];
}
