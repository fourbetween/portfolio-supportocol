import { consume } from "@lit/context";
import { msg } from "@lit/localize";
import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { workspaceContext } from "../../../app/context/workspace";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { titleStyle } from "../../../shared/style/title";
import { widgetStyle } from "../../../shared/style/widget";
import "../../../shared/ui/icons/icon-close";
import "../../../shared/ui/icons/icon-content-paste";
import { buildSortedChildrenMap } from "../../../shared/util/comment-tree";
import type { WorkspaceWithMember } from "../../workspace/model/workspace";
import {
  LearningCommentArchiveEvent,
  LearningCommentCreateEvent,
  LearningCommentCreatedEvent,
  LearningCommentCutEvent,
  LearningCommentDeleteEvent,
  LearningCommentDeletedEvent,
  LearningCommentGenerateEvent,
  LearningCommentGeneratedEvent,
  LearningCommentLiftEvent,
  LearningCommentMoveEvent,
  LearningCommentSelectEvent,
  LearningCommentUnarchiveEvent,
  LearningCommentUpdateEvent,
  LearningCommentUpdatedEvent,
  LearningProposedCommentAcceptEvent,
  LearningProposedCommentRejectEvent,
} from "../event/comment";
import { LearningIssueRemoveEvent } from "../event/issue";
import type { Comment } from "../model/comment";
import { deriveCommentFrame } from "../model/comment-frame";
import { commentRepository } from "../repository/comment-repository";
import "../ui/comment-context";
import "../ui/comment-tree";
import "./comment-create-widget";

@customElement("learning-comment-explorer-widget")
export class LearningCommentExplorerWidget extends LitElement {
  @consume({ context: workspaceContext, subscribe: true })
  private workspace?: WorkspaceWithMember;

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

  @state()
  private cutCommentId?: string;

  private commentMap = new Map<string, Comment>();
  private childrenMap = new Map<string, Comment[]>();

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("comments")) {
      this.updateDerivedData();
    }
    if (changedProperties.has("selectedCommentId")) {
      this.cutCommentId = undefined;
    }
  }

  updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("selectedCommentId") && this.selectedCommentId) {
      requestAnimationFrame(() => {
        this.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("keydown", this._handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this._handleKeyDown);
  }

  private _handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (this.selectedCommentId) {
        this.handleClearSelection();
      }
      if (this.cutCommentId) {
        this.cutCommentId = undefined;
      }
    }
  };

  private updateDerivedData() {
    this.commentMap.clear();
    this.childrenMap.clear();
    this.childCounts = new Map();
    this.availableTypes = [];

    if (this.comments) {
      this.availableTypes = deriveCommentFrame(this.comments).types;
      for (const comment of this.comments) {
        this.commentMap.set(comment.id, comment);
      }
      this.childrenMap = buildSortedChildrenMap(this.comments);

      for (const [parentId, children] of this.childrenMap) {
        this.childCounts.set(
          parentId,
          children.filter((c) => c.status === "active" && !c.archivedAt).length,
        );
      }
    }

    if (this.cutCommentId && !this.commentMap.has(this.cutCommentId)) {
      this.cutCommentId = undefined;
    }
  }

  private async handleCommentUpdate(e: LearningCommentUpdateEvent) {
    if (!this.discussionId || !this.workspace) return;
    try {
      const data = await commentRepository.update(
        this.workspace.workspace.id,
        this.discussionId,
        e.commentId,
        { commentType: e.commentType, content: e.content },
      );

      showToast(this, msg("Comment updated."), "success", 2000);
      this.dispatchEvent(new LearningCommentUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleCommentDelete(e: LearningCommentDeleteEvent) {
    if (!this.discussionId || !this.workspace) return;
    if (!confirm(msg("Are you sure you want to delete this comment?"))) return;

    try {
      await commentRepository.delete(
        this.workspace.workspace.id,
        this.discussionId,
        e.commentId,
      );

      showToast(this, msg("Comment deleted."), "success", 2000);
      this.dispatchEvent(new LearningCommentDeletedEvent(e.commentId));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleCommentLift(e: LearningCommentLiftEvent) {
    if (!this.discussionId || !this.workspace) return;
    if (
      !confirm(msg("Delete this comment and lift its replies to its parent?"))
    )
      return;

    try {
      await commentRepository.lift(
        this.workspace.workspace.id,
        this.discussionId,
        e.commentId,
      );

      showToast(this, msg("Comment deleted."), "success", 2000);
      this.dispatchEvent(new LearningCommentDeletedEvent(e.commentId));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleCommentArchive(e: LearningCommentArchiveEvent) {
    if (!this.discussionId || !this.workspace) return;
    try {
      const data = await commentRepository.archive(
        this.workspace.workspace.id,
        this.discussionId,
        e.commentId,
      );

      showToast(this, msg("Comment archived."), "success", 2000);
      this.dispatchEvent(new LearningCommentUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleCommentUnarchive(e: LearningCommentUnarchiveEvent) {
    if (!this.discussionId || !this.workspace) return;
    try {
      const data = await commentRepository.unarchive(
        this.workspace.workspace.id,
        this.discussionId,
        e.commentId,
      );

      showToast(this, msg("Comment unarchived."), "success", 2000);
      this.dispatchEvent(new LearningCommentUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleCommentGenerate(e: LearningCommentGenerateEvent) {
    if (
      !this.discussionId ||
      !this.workspace ||
      !e.parentCommentId ||
      !e.commentType
    )
      return;
    try {
      const comments = await commentRepository.generateChildren(
        this.workspace.workspace.id,
        this.discussionId,
        e.parentCommentId,
        e.commentType,
      );

      showToast(this, msg("Comments generated."), "success", 2000);
      this.dispatchEvent(
        new LearningCommentGeneratedEvent(
          e.parentCommentId,
          e.commentType,
          comments,
        ),
      );
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private handleCommentCut(e: LearningCommentCutEvent) {
    this.cutCommentId = e.commentId;
  }

  private async handleCommentMove(e: LearningCommentMoveEvent) {
    if (!this.discussionId || !this.workspace) return;

    const sourceComment = this.commentMap.get(e.commentId);
    if (!sourceComment) {
      this.cutCommentId = undefined;
      return;
    }

    if (sourceComment.parentCommentId === e.parentCommentId) {
      this.cutCommentId = undefined;
      return;
    }

    if (
      e.parentCommentId &&
      this.getInvalidPasteTargetIds(e.commentId).includes(e.parentCommentId)
    ) {
      showToast(this, msg("Cannot move a comment to its descendant."), "error");
      return;
    }

    try {
      const data = await commentRepository.updateParent(
        this.workspace.workspace.id,
        this.discussionId,
        e.commentId,
        e.parentCommentId,
      );

      this.cutCommentId = undefined;
      showToast(this, msg("Comment moved."), "success", 2000);
      this.dispatchEvent(new LearningCommentUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleCommentCreate(e: LearningCommentCreateEvent) {
    if (!this.discussionId || !this.workspace) return;
    try {
      const data = await commentRepository.create(
        this.workspace.workspace.id,
        this.discussionId,
        {
          parentCommentId: e.parentCommentId,
          commentType: e.commentType,
          content: e.content,
        },
      );

      showToast(this, msg("Comment created."), "success", 2000);
      if (data) {
        this.dispatchEvent(new LearningCommentCreatedEvent(data));
      }
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleAccept(e: LearningProposedCommentAcceptEvent) {
    if (!this.discussionId || !this.workspace) return;
    const comment = e.comment;

    try {
      const data = await commentRepository.updateStatus(
        this.workspace.workspace.id,
        this.discussionId,
        comment.id,
        "active",
      );

      showToast(this, msg("Comment activated."), "success", 2000);
      this.dispatchEvent(new LearningCommentUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleReject(e: LearningProposedCommentRejectEvent) {
    if (!this.discussionId || !this.workspace) return;
    const comment = e.comment;
    try {
      await commentRepository.delete(
        this.workspace.workspace.id,
        this.discussionId,
        comment.id,
      );

      showToast(this, msg("Comment deleted."), "success", 2000);
      this.dispatchEvent(new LearningCommentDeletedEvent(comment.id));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleIssueRemove(e: LearningIssueRemoveEvent) {
    if (!this.discussionId || !this.workspace) return;
    try {
      const data = await commentRepository.removeIssue(
        this.workspace.workspace.id,
        this.discussionId,
        e.commentId,
        e.issueId,
      );

      showToast(this, msg("Issue removed."), "success", 2000);
      this.dispatchEvent(new LearningCommentUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private handleClearSelection() {
    this.dispatchEvent(new LearningCommentSelectEvent(undefined));
    this.cutCommentId = undefined;
  }

  private handlePasteToRoot() {
    if (!this.cutCommentId) {
      return;
    }

    this.handleCommentMove(
      new LearningCommentMoveEvent(this.cutCommentId, null),
    );
  }

  private getInvalidPasteTargetIds(commentId?: string): string[] {
    if (!commentId) {
      return [];
    }

    return [
      commentId,
      ...this.getDescendants(commentId).map((comment) => comment.id),
    ];
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
    const invalidPasteTargetIds = this.getInvalidPasteTargetIds(
      this.cutCommentId,
    );

    return html`
      <div class="container">
        ${this.cutCommentId
          ? html`
              <button class="btn paste-button" @click=${this.handlePasteToRoot}>
                <ui-icon-content-paste .size=${18}></ui-icon-content-paste>
                <span>${msg("Paste as root")}</span>
              </button>
            `
          : nothing}
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
          <div class="section-header">
            <div class="section-title">
              ${this.selectedCommentId ? msg("Replies") : msg("All Comments")}
            </div>
          </div>
          <learning-comment-tree
            .comments=${descendants}
            .readonly=${this.readonly}
            .cutCommentId=${this.cutCommentId}
            .invalidPasteTargetIds=${invalidPasteTargetIds}
            @learning-comment-create=${this.handleCommentCreate}
            @learning-comment-update=${this.handleCommentUpdate}
            @learning-comment-delete=${this.handleCommentDelete}
            @learning-comment-lift=${this.handleCommentLift}
            @learning-comment-archive=${this.handleCommentArchive}
            @learning-comment-unarchive=${this.handleCommentUnarchive}
            @learning-comment-generate=${this.handleCommentGenerate}
            @learning-comment-cut=${this.handleCommentCut}
            @learning-comment-move=${this.handleCommentMove}
            @learning-proposed-comment-accept=${this.handleAccept}
            @learning-proposed-comment-reject=${this.handleReject}
            @learning-issue-remove=${this.handleIssueRemove}
          ></learning-comment-tree>
        </div>
      </div>
    `;
  }

  private renderContextSection(path: Comment[]) {
    if (path.length === 0) return nothing;

    const invalidPasteTargetIds = this.getInvalidPasteTargetIds(
      this.cutCommentId,
    );

    return html`
      <div class="section">
        <div class="section-header">
          <div class="section-title">${msg("Context")}</div>
          <button class="clear-button" @click=${this.handleClearSelection}>
            <ui-icon-close></ui-icon-close>
            <span>${msg("Clear Selection")}</span>
          </button>
        </div>
        <learning-comment-context
          .path=${path}
          .childCounts=${this.childCounts}
          .availableTypes=${this.availableTypes}
          .readonly=${this.readonly}
          .cutCommentId=${this.cutCommentId}
          .invalidPasteTargetIds=${invalidPasteTargetIds}
          @learning-comment-create=${this.handleCommentCreate}
          @learning-comment-update=${this.handleCommentUpdate}
          @learning-comment-delete=${this.handleCommentDelete}
          @learning-comment-lift=${this.handleCommentLift}
          @learning-comment-archive=${this.handleCommentArchive}
          @learning-comment-unarchive=${this.handleCommentUnarchive}
          @learning-comment-generate=${this.handleCommentGenerate}
          @learning-comment-cut=${this.handleCommentCut}
          @learning-comment-move=${this.handleCommentMove}
          @learning-proposed-comment-accept=${this.handleAccept}
          @learning-proposed-comment-reject=${this.handleReject}
          @learning-issue-remove=${this.handleIssueRemove}
        ></learning-comment-context>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    titleStyle,
    widgetStyle,
    css`
      .container {
        padding-top: 24px;
      }
      .paste-button {
        color: var(--color-fg-muted);
        border: 1px dashed var(--color-border-default);
        width: 100%;
        justify-content: flex-start;
        background: transparent;
        font-weight: 400;
        margin-bottom: 8px;
        box-sizing: border-box;
      }
      .paste-button:hover {
        background-color: var(--color-canvas-subtle);
        border-style: solid;
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
    `,
  ];
}
