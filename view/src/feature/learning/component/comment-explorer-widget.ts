import { consume } from "@lit/context";
import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { userContext } from "../../../app/context/user";
import type { User } from "../../../app/model/user";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { iconStyle } from "../../../shared/style/icon";
import { titleStyle } from "../../../shared/style/title";
import { widgetStyle } from "../../../shared/style/widget";
import {
  LearningCommentArchiveEvent,
  LearningCommentCreateEvent,
  LearningCommentCreatedEvent,
  LearningCommentDeleteEvent,
  LearningCommentDeletedEvent,
  LearningCommentGenerateEvent,
  LearningCommentGeneratedEvent,
  LearningCommentSelectEvent,
  LearningCommentUnarchiveEvent,
  LearningCommentUpdateEvent,
  LearningCommentUpdatedEvent,
  LearningProposedCommentAcceptEvent,
  LearningProposedCommentRejectEvent,
} from "../event/comment";
import type { Comment } from "../model/comment";
import { deriveCommentFrame } from "../model/comment-frame";
import { commentRepository } from "../repository/comment-repository";
import "../ui/comment-context/comment-context";
import "../ui/comment-tree/comment-tree";
import "./comment-create-widget";

@customElement("learning-comment-explorer-widget")
export class LearningCommentExplorerWidget extends LitElement {
  @consume({ context: userContext, subscribe: true })
  private user?: User;

  @property({ type: String })
  discussionId?: string;

  @property({ type: Array })
  comments?: Comment[];

  @property({ type: String })
  selectedCommentId?: string;

  @property({ type: Boolean })
  readonly = false;

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
          children.filter((c) => c.status === "active" && !c.archivedAt).length,
        );
      }
    }
  }

  private async handleCommentUpdate(e: LearningCommentUpdateEvent) {
    const workspaceId = this.user ? "personal-" + this.user.id : undefined;
    if (!this.discussionId || !workspaceId) return;
    try {
      const data = await commentRepository.update(
        workspaceId,
        this.discussionId,
        e.commentId,
        { commentType: e.commentType, content: e.content },
      );

      showToast(this, "Comment updated.", "success", 2000);
      this.dispatchEvent(new LearningCommentUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleCommentDelete(e: LearningCommentDeleteEvent) {
    const workspaceId = this.user ? "personal-" + this.user.id : undefined;
    if (!this.discussionId || !workspaceId) return;
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await commentRepository.delete(
        workspaceId,
        this.discussionId,
        e.commentId,
      );

      showToast(this, "Comment deleted.", "success", 2000);
      this.dispatchEvent(new LearningCommentDeletedEvent(e.commentId));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleCommentArchive(e: LearningCommentArchiveEvent) {
    const workspaceId = this.user ? "personal-" + this.user.id : undefined;
    if (!this.discussionId || !workspaceId) return;
    try {
      const data = await commentRepository.archive(
        workspaceId,
        this.discussionId,
        e.commentId,
      );

      showToast(this, "Comment archived.", "success", 2000);
      this.dispatchEvent(new LearningCommentUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleCommentUnarchive(e: LearningCommentUnarchiveEvent) {
    const workspaceId = this.user ? "personal-" + this.user.id : undefined;
    if (!this.discussionId || !workspaceId) return;
    try {
      const data = await commentRepository.unarchive(
        workspaceId,
        this.discussionId,
        e.commentId,
      );

      showToast(this, "Comment unarchived.", "success", 2000);
      this.dispatchEvent(new LearningCommentUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleCommentGenerate(e: LearningCommentGenerateEvent) {
    const workspaceId = this.user ? "personal-" + this.user.id : undefined;
    if (
      !this.discussionId ||
      !workspaceId ||
      !e.parentCommentId ||
      !e.commentType
    )
      return;
    try {
      await commentRepository.generate(workspaceId, this.discussionId, {
        parentCommentId: e.parentCommentId,
        commentType: e.commentType,
      });

      showToast(this, "Comments generated.", "success", 2000);
      this.dispatchEvent(
        new LearningCommentGeneratedEvent(e.parentCommentId, e.commentType),
      );
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleCommentCreate(e: LearningCommentCreateEvent) {
    const workspaceId = this.user ? "personal-" + this.user.id : undefined;
    if (!this.discussionId || !workspaceId) return;
    try {
      const data = await commentRepository.create(
        workspaceId,
        this.discussionId,
        {
          parentCommentId: e.parentCommentId,
          commentType: e.commentType,
          content: e.content,
        },
      );

      showToast(this, "Comment created.", "success", 2000);
      if (data) {
        this.dispatchEvent(new LearningCommentCreatedEvent(data));
      }
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleAccept(e: LearningProposedCommentAcceptEvent) {
    const workspaceId = this.user ? "personal-" + this.user.id : undefined;
    if (!this.discussionId || !workspaceId) return;
    const comment = e.comment;

    try {
      const data = await commentRepository.updateStatus(
        workspaceId,
        this.discussionId,
        comment.id,
        "active",
      );

      showToast(this, "Comment activated.", "success", 2000);
      this.dispatchEvent(new LearningCommentUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleReject(e: LearningProposedCommentRejectEvent) {
    const workspaceId = this.user ? "personal-" + this.user.id : undefined;
    if (!this.discussionId || !workspaceId) return;
    const comment = e.comment;
    try {
      await commentRepository.delete(
        workspaceId,
        this.discussionId,
        comment.id,
      );

      showToast(this, "Comment deleted.", "success", 2000);
      this.dispatchEvent(new LearningCommentDeletedEvent(comment.id));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private handleClearSelection() {
    this.dispatchEvent(new LearningCommentSelectEvent(undefined));
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
        ${this.selectedCommentId || this.readonly
          ? nothing
          : html`
              <learning-comment-create-widget
                .discussionId=${this.discussionId}
                .parentCommentId=${this.selectedCommentId}
                .availableTypes=${this.availableTypes}
              ></learning-comment-create-widget>
            `}
        <div class="section">
          <div class="section-title">
            ${this.selectedCommentId ? "Replies" : "All Comments"}
          </div>
          <learning-comment-tree
            .comments=${descendants}
            .readonly=${this.readonly}
            @learning-comment-create=${this.handleCommentCreate}
            @learning-comment-update=${this.handleCommentUpdate}
            @learning-comment-delete=${this.handleCommentDelete}
            @learning-comment-archive=${this.handleCommentArchive}
            @learning-comment-unarchive=${this.handleCommentUnarchive}
            @learning-comment-generate=${this.handleCommentGenerate}
            @learning-proposed-comment-accept=${this.handleAccept}
            @learning-proposed-comment-reject=${this.handleReject}
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
          .readonly=${this.readonly}
          @learning-comment-create=${this.handleCommentCreate}
          @learning-comment-update=${this.handleCommentUpdate}
          @learning-comment-delete=${this.handleCommentDelete}
          @learning-comment-archive=${this.handleCommentArchive}
          @learning-comment-unarchive=${this.handleCommentUnarchive}
          @learning-comment-generate=${this.handleCommentGenerate}
          @learning-proposed-comment-accept=${this.handleAccept}
          @learning-proposed-comment-reject=${this.handleReject}
        ></learning-comment-context>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    titleStyle,
    widgetStyle,
    css`
      :host {
        display: block;
      }
      .section-header .section-title {
        margin-bottom: 0;
      }
      .archived-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background-color: var(--color-canvas-subtle);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        color: var(--color-fg-muted);
      }
      .archived-info .material-symbols-outlined {
        font-size: 20px;
      }
    `,
  ];
}
