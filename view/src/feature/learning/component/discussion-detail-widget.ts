import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import {
  LearningDiscussionArchiveEvent,
  LearningDiscussionUnarchiveEvent,
  LearningDiscussionUpdateCommentFrameEvent,
  LearningDiscussionUpdatedEvent,
  LearningDiscussionUpdateEvent,
  LearningDiscussionUpdateStatusEvent,
} from "../event/discussion";
import type { Comment } from "../model/comment";
import { deriveCommentFrame } from "../model/comment-frame";
import type { Discussion } from "../model/discussion";
import { discussionRepository } from "../repository/discussion-repository";
import "../ui/discussion-detail/discussion-detail";

@customElement("learning-discussion-detail-widget")
export class LearningDiscussionDetailWidget extends LitElement {
  @property({ type: Object })
  discussion?: Discussion;

  @property({ type: Array })
  comments: Comment[] = [];

  @state()
  private _isEditing = false;

  private async _handleUpdateDiscussion(e: LearningDiscussionUpdateEvent) {
    if (!this.discussion) return;
    try {
      const data = await discussionRepository.update(
        this.discussion.id,
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
    if (!this.discussion) return;
    try {
      let commentFrame;
      if (e.status === "public") {
        commentFrame = deriveCommentFrame(this.comments);
      }
      const data = await discussionRepository.updateStatus(
        this.discussion.id,
        e.status,
        commentFrame,
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

  private async _handleUpdateCommentFrame(
    e: LearningDiscussionUpdateCommentFrameEvent,
  ) {
    if (!this.discussion) return;
    try {
      const data = await discussionRepository.updateStatus(
        this.discussion.id,
        this.discussion.status,
        e.commentFrame,
      );
      this.discussion = data;
      showToast(this, "Comment frame updated.", "success", 2000);
      this.dispatchEvent(new LearningDiscussionUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async _handleArchiveDiscussion(e: LearningDiscussionArchiveEvent) {
    if (!this.discussion) return;
    try {
      const data = await discussionRepository.archive(e.discussionId);
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
    if (!this.discussion) return;
    try {
      const data = await discussionRepository.unarchive(e.discussionId);
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
        @learning-discussion-update-comment-frame=${this
          ._handleUpdateCommentFrame}
        @learning-discussion-archive=${this._handleArchiveDiscussion}
        @learning-discussion-unarchive=${this._handleUnarchiveDiscussion}
      ></learning-discussion-detail>
    `;
  }

  static styles = [baseStyle];
}
