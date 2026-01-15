import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import {
  LearningDiscussionUpdatedEvent,
  LearningDiscussionUpdateEvent,
} from "../event/discussion";
import { deriveCommentFrame } from "../model/comment-frame";
import type { Discussion } from "../model/discussion";
import { commentRepository } from "../repository/comment-repository";
import { discussionRepository } from "../repository/discussion-repository";
import "../ui/discussion-detail/discussion-detail";

@customElement("learning-discussion-detail-widget")
export class LearningDiscussionDetailWidget extends LitElement {
  @property({ type: Object })
  discussion?: Discussion;

  @state()
  private _isEditing = false;

  private async _handleUpdateDiscussion(e: LearningDiscussionUpdateEvent) {
    if (!this.discussion) return;
    try {
      const data = await discussionRepository.update(
        this.discussion.id,
        e.theme
      );
      this.discussion = data;
      this._isEditing = false;
      showToast(this, "Theme updated.", "success", 2000);

      this.dispatchEvent(new LearningDiscussionUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async _handlePublishDiscussion() {
    if (!this.discussion) return;
    try {
      const comments = await commentRepository.list(this.discussion.id);
      const commentFrame = deriveCommentFrame(comments);
      const data = await discussionRepository.publish(
        this.discussion.id,
        commentFrame
      );
      this.discussion = data;
      showToast(this, "Discussion published.", "success", 2000);

      this.dispatchEvent(new LearningDiscussionUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  render() {
    if (!this.discussion) return nothing;

    return html`
      <learning-discussion-detail
        .discussion=${this.discussion}
        .isEditing=${this._isEditing}
        @learning-discussion-form-open=${() => (this._isEditing = true)}
        @learning-discussion-update=${this._handleUpdateDiscussion}
        @learning-discussion-form-close=${() => (this._isEditing = false)}
        @learning-discussion-publish=${this._handlePublishDiscussion}
      ></learning-discussion-detail>
    `;
  }

  static styles = [baseStyle];
}
