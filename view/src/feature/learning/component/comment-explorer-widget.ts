import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { iconStyle } from "../../../shared/style/icon";
import { titleStyle } from "../../../shared/style/title";
import {
  CommentCreateEvent,
  CommentCreatedEvent,
  CommentDeleteEvent,
  CommentDeletedEvent,
  CommentGenerateEvent,
  CommentGeneratedEvent,
  CommentSelectEvent,
  CommentUpdateEvent,
  CommentUpdatedEvent,
  ProposedCommentAcceptEvent,
  ProposedCommentRejectEvent,
} from "../event/comment";
import type { Comment } from "../model/comment";
import { deriveCommentFrame } from "../model/comment-frame";
import { commentRepository } from "../repository/comment-repository";
import "../ui/comment-context/comment-context";
import "../ui/comment-tree/comment-tree";
import "./comment-create-widget";

@customElement("learning-comment-explorer-widget")
export class LearningCommentExplorerWidget extends LitElement {
  @property({ type: String })
  discussionId?: string;

  @property({ type: Array })
  comments?: Comment[];

  @property({ type: String })
  selectedCommentId?: string;

  @state()
  private availableTypes: string[] = [];

  @state()
  private childCounts = new Map<string, number>();

  private commentMap = new Map<string, Comment>();
  private childrenMap = new Map<string, Comment[]>();

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("comments")) {
      this.updateDerivedData();
    }
  }

  private updateDerivedData() {
    this.commentMap.clear();
    this.childrenMap.clear();
    this.childCounts = new Map();
    this.availableTypes = [];

    if (this.comments) {
      this.availableTypes = deriveCommentFrame(this.comments).types;
      for (const comment of this.comments) {
        this.commentMap.set(comment.id, comment);
        if (comment.parentCommentId) {
          const children = this.childrenMap.get(comment.parentCommentId) || [];
          children.push(comment);
          this.childrenMap.set(comment.parentCommentId, children);
        }
      }

      for (const [parentId, children] of this.childrenMap) {
        this.childCounts.set(
          parentId,
          children.filter((c) => c.status === "active").length
        );
      }
    }
  }

  private handleSelectComment(e: CommentSelectEvent) {
    const id = this.selectedCommentId === e.commentId ? undefined : e.commentId;
    this.dispatchEvent(new CommentSelectEvent(id));
  }

  private async handleCommentUpdate(e: CommentUpdateEvent) {
    if (!this.discussionId) return;
    try {
      const data = await commentRepository.update(
        this.discussionId,
        e.commentId,
        { commentType: e.commentType, content: e.content }
      );

      showToast(this, "Comment updated.", "success", 2000);
      this.dispatchEvent(new CommentUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleCommentDelete(e: CommentDeleteEvent) {
    if (!this.discussionId) return;
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await commentRepository.delete(this.discussionId, e.commentId);

      showToast(this, "Comment deleted.", "success", 2000);
      this.dispatchEvent(new CommentDeletedEvent(e.commentId));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleCommentGenerate(e: CommentGenerateEvent) {
    if (!this.discussionId || !e.parentCommentId || !e.commentType) return;
    try {
      await commentRepository.generate(this.discussionId, {
        parentCommentId: e.parentCommentId,
        commentType: e.commentType,
      });

      showToast(this, "Comments generated.", "success", 2000);
      this.dispatchEvent(
        new CommentGeneratedEvent(e.parentCommentId, e.commentType)
      );
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleCommentCreate(e: CommentCreateEvent) {
    if (!this.discussionId) return;
    try {
      const data = await commentRepository.create(this.discussionId, {
        parentCommentId: e.parentCommentId,
        commentType: e.commentType,
        content: e.content,
      });

      showToast(this, "Comment created.", "success", 2000);
      if (data) {
        this.dispatchEvent(new CommentCreatedEvent(data));
      }
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleAccept(e: ProposedCommentAcceptEvent) {
    if (!this.discussionId) return;
    const comment = e.comment;

    try {
      const data = await commentRepository.updateStatus(
        this.discussionId,
        comment.id,
        "active"
      );

      showToast(this, "Comment activated.", "success", 2000);
      this.dispatchEvent(new CommentUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleReject(e: ProposedCommentRejectEvent) {
    if (!this.discussionId) return;
    const comment = e.comment;
    try {
      await commentRepository.delete(this.discussionId, comment.id);

      showToast(this, "Comment deleted.", "success", 2000);
      this.dispatchEvent(new CommentDeletedEvent(comment.id));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private handleClearSelection() {
    this.dispatchEvent(new CommentSelectEvent(undefined));
  }

  private get _path(): Comment[] {
    return this.selectedCommentId
      ? this.getPathToRoot(this.selectedCommentId)
      : [];
  }

  private get _descendants(): Comment[] {
    return this.selectedCommentId
      ? this.getDescendants(this.selectedCommentId)
      : this.comments || [];
  }

  private getPathToRoot(selectedId: string): Comment[] {
    const path: Comment[] = [];
    let currentId: string | null = selectedId;

    while (currentId) {
      const comment = this.commentMap.get(currentId);
      if (!comment) break;
      path.unshift(comment);
      currentId = comment.parentCommentId;
    }

    return path;
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
    const path = this._path;
    const descendants = this._descendants;

    return html`
      <div class="container">
        ${this.renderContextSection(path)}
        ${this.selectedCommentId
          ? nothing
          : html`
              <learning-comment-create-widget
                .discussionId=${this.discussionId}
                .parentCommentId=${this.selectedCommentId}
                .comments=${this.comments}
              ></learning-comment-create-widget>
            `}
        <div class="section">
          <div class="section-title">
            ${this.selectedCommentId ? "Replies" : "All Comments"}
          </div>
          <learning-comment-tree
            .comments=${descendants}
            @comment-select=${this.handleSelectComment}
            @comment-create=${this.handleCommentCreate}
            @comment-update=${this.handleCommentUpdate}
            @comment-delete=${this.handleCommentDelete}
            @comment-generate=${this.handleCommentGenerate}
            @proposed-comment-accept=${this.handleAccept}
            @proposed-comment-reject=${this.handleReject}
          ></learning-comment-tree>
        </div>
      </div>
    `;
  }

  private renderContextSection(path: Comment[]) {
    if (path.length === 0) return nothing;

    return html`
      <div class="section">
        <div class="section-header">
          <div class="section-title">Context</div>
          <button class="clear-button" @click=${this.handleClearSelection}>
            <span class="material-symbols-outlined">close</span>
            <span>Clear Selection</span>
          </button>
        </div>
        <learning-comment-context
          .path=${path}
          .childCounts=${this.childCounts}
          .availableTypes=${this.availableTypes}
          @comment-select=${this.handleSelectComment}
          @comment-create=${this.handleCommentCreate}
          @comment-update=${this.handleCommentUpdate}
          @comment-delete=${this.handleCommentDelete}
          @comment-generate=${this.handleCommentGenerate}
          @proposed-comment-accept=${this.handleAccept}
          @proposed-comment-reject=${this.handleReject}
        ></learning-comment-context>
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
