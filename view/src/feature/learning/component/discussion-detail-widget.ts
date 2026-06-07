import { consume } from "@lit/context";
import { msg, str } from "@lit/localize";
import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { workspaceContext } from "../../../app/context/workspace";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import type { WorkspaceWithMember } from "../../workspace/model/workspace";
import {
  LearningDiscussionArchiveEvent,
  LearningDiscussionCommentGenerateEvent,
  LearningDiscussionDeletedEvent,
  LearningDiscussionDeleteEvent,
  LearningDiscussionUnarchiveEvent,
  LearningDiscussionUpdatedEvent,
  LearningDiscussionUpdateDialogueSettingsEvent,
  LearningDiscussionUpdateEvent,
  LearningDiscussionUpdateStatusEvent,
} from "../event/discussion";
import { LearningCommentGeneratedEvent } from "../event/comment";
import type { Comment } from "../model/comment";
import { deriveCommentFrame } from "../model/comment-frame";
import type { DialogueSettings, Discussion } from "../model/discussion";
import { commentRepository } from "../repository/comment-repository";
import { discussionRepository } from "../repository/discussion-repository";
import "../ui/discussion-detail";

@customElement("learning-discussion-detail-widget")
export class LearningDiscussionDetailWidget extends LitElement {
  @consume({ context: workspaceContext, subscribe: true })
  private workspace?: WorkspaceWithMember;

  @property({ type: Object })
  discussion?: Discussion;

  @property({ type: Array })
  comments: Comment[] = [];

  @state()
  private _isEditing = false;

  private async _handleUpdateDiscussion(e: LearningDiscussionUpdateEvent) {
    if (!this.discussion || !this.workspace) return;
    try {
      const data = await discussionRepository.update(
        this.workspace.workspace.id,
        this.discussion.id,
        this.discussion.projectId,
        e.theme,
        e.premise,
        e.conclusion,
        e.language,
      );
      this.discussion = data;
      this._isEditing = false;
      showToast(this, msg("Discussion updated."), "success", 2000);

      this.dispatchEvent(new LearningDiscussionUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async _handleUpdateDiscussionStatus(
    e: LearningDiscussionUpdateStatusEvent,
  ) {
    if (!this.discussion || !this.workspace) return;
    try {
      let dialogueSettings: DialogueSettings | undefined;
      if (e.status !== "private") {
        dialogueSettings = {
          commentFrame:
            this.discussion.dialogueSettings?.commentFrame ??
            deriveCommentFrame(this.comments),
          commentPermission:
            this.discussion.dialogueSettings?.commentPermission ?? "everyone",
          issuePermission:
            this.discussion.dialogueSettings?.issuePermission ?? "everyone",
        };
      }
      const data = await discussionRepository.updateStatus(
        this.workspace.workspace.id,
        this.discussion.id,
        e.status,
        dialogueSettings,
      );
      this.discussion = data;
      const message =
        e.status === "public"
          ? msg("Discussion published.")
          : msg("Discussion unpublished.");
      showToast(this, message, "success", 2000);

      this.dispatchEvent(new LearningDiscussionUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async _handleUpdateDialogueSettings(
    e: LearningDiscussionUpdateDialogueSettingsEvent,
  ) {
    if (!this.discussion || !this.workspace) return;
    try {
      const data = await discussionRepository.updateStatus(
        this.workspace.workspace.id,
        this.discussion.id,
        this.discussion.status,
        e.settings,
      );
      this.discussion = data;
      showToast(this, msg("Dialogue settings updated."), "success", 2000);
      this.dispatchEvent(new LearningDiscussionUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async _handleArchiveDiscussion(e: LearningDiscussionArchiveEvent) {
    if (!this.discussion || !this.workspace) return;
    try {
      const data = await discussionRepository.archive(
        this.workspace.workspace.id,
        e.discussionId,
      );
      this.discussion = data;
      showToast(this, msg("Discussion archived."), "success", 2000);
      this.dispatchEvent(new LearningDiscussionUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async _handleUnarchiveDiscussion(
    e: LearningDiscussionUnarchiveEvent,
  ) {
    if (!this.discussion || !this.workspace) return;
    try {
      const data = await discussionRepository.unarchive(
        this.workspace.workspace.id,
        e.discussionId,
      );
      this.discussion = data;
      showToast(this, msg("Discussion unarchived."), "success", 2000);
      this.dispatchEvent(new LearningDiscussionUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async _handleDeleteDiscussion(e: LearningDiscussionDeleteEvent) {
    if (!this.discussion || !this.workspace) return;
    if (
      !confirm(
        msg(str`Are you sure you want to delete "${this.discussion.theme}"?`),
      )
    ) {
      return;
    }
    try {
      await discussionRepository.delete(
        this.workspace.workspace.id,
        this.discussion.projectId,
        e.discussionId,
      );
      showToast(this, msg("Discussion deleted."), "success", 2000);
      this.dispatchEvent(new LearningDiscussionDeletedEvent(e.discussionId));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async _handleCommentGenerate(
    e: LearningDiscussionCommentGenerateEvent,
  ) {
    if (!this.discussion || !this.workspace) return;
    try {
      const comments = await commentRepository.generateComments(
        this.workspace.workspace.id,
        this.discussion.id,
        e.sourceText,
        e.sourceUrls,
        e.modelLevel,
        e.commentFrame,
      );

      showToast(this, msg("Comments generated."), "success", 2000);
      this.dispatchEvent(new LearningCommentGeneratedEvent(undefined, undefined, comments));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private get _usedFrame() {
    return deriveCommentFrame(this.comments);
  }

  render() {
    if (!this.discussion) return nothing;

    return html`
      <learning-discussion-detail
        .discussion=${this.discussion}
        .comments=${this.comments}
        .usedFrame=${this._usedFrame}
        .isEditing=${this._isEditing}
        .isFree=${this.workspace?.workspace.subscription.plan.isFree ?? true}
        @learning-discussion-form-open=${() => (this._isEditing = true)}
        @learning-discussion-update=${this._handleUpdateDiscussion}
        @learning-discussion-form-close=${() => (this._isEditing = false)}
        @learning-discussion-update-status=${this._handleUpdateDiscussionStatus}
        @learning-discussion-update-dialogue-settings=${this
          ._handleUpdateDialogueSettings}
        @learning-discussion-archive=${this._handleArchiveDiscussion}
        @learning-discussion-unarchive=${this._handleUnarchiveDiscussion}
        @learning-discussion-delete=${this._handleDeleteDiscussion}
        @learning-discussion-comment-generate=${this._handleCommentGenerate}
      ></learning-discussion-detail>
    `;
  }

  static styles = [baseStyle];
}
