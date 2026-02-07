import { consume } from "@lit/context";
import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { workspaceContext } from "../../../app/context/workspace";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import type { WorkspaceWithMember } from "../../workspace/model/workspace";
import {
  LearningDiscussionArchiveEvent,
  LearningDiscussionUnarchiveEvent,
  LearningDiscussionUpdatedEvent,
  LearningDiscussionUpdateDialogueSettingsEvent,
  LearningDiscussionUpdateEvent,
  LearningDiscussionUpdateStatusEvent,
} from "../event/discussion";
import type { Comment } from "../model/comment";
import { deriveCommentFrame } from "../model/comment-frame";
import type { DialogueSettings, Discussion } from "../model/discussion";
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
        e.conclusion,
      );
      this.discussion = data;
      this._isEditing = false;
      showToast(this, "Discussion updated.", "success", 2000);

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
            this.discussion.dialogueSettings?.commentPermission ??
            "authenticated",
          issuePermission:
            this.discussion.dialogueSettings?.issuePermission ??
            "authenticated",
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
          ? "Discussion published."
          : "Discussion unpublished.";
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
      showToast(this, "Dialogue settings updated.", "success", 2000);
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
      showToast(this, "Discussion archived.", "success", 2000);
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
      showToast(this, "Discussion unarchived.", "success", 2000);
      this.dispatchEvent(new LearningDiscussionUpdatedEvent(data));
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
        .usedFrame=${this._usedFrame}
        .isEditing=${this._isEditing}
        @learning-discussion-form-open=${() => (this._isEditing = true)}
        @learning-discussion-update=${this._handleUpdateDiscussion}
        @learning-discussion-form-close=${() => (this._isEditing = false)}
        @learning-discussion-update-status=${this._handleUpdateDiscussionStatus}
        @learning-discussion-update-dialogue-settings=${this
          ._handleUpdateDialogueSettings}
        @learning-discussion-archive=${this._handleArchiveDiscussion}
        @learning-discussion-unarchive=${this._handleUnarchiveDiscussion}
      ></learning-discussion-detail>
    `;
  }

  static styles = [baseStyle];
}
