import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import {
  DiscussionUpdatedEvent,
  DiscussionUpdateEvent,
} from "../event/discussion";
import type { Discussion } from "../model/discussion";
import { discussionRepository } from "../repository/discussion-repository";
import "../ui/discussion-detail/discussion-detail";

@customElement("learning-discussion-detail-widget")
export class LearningDiscussionDetailWidget extends LitElement {
  @property({ type: Object })
  discussion?: Discussion;

  @state()
  private _isEditing = false;

  private async _handleUpdateDiscussion(e: DiscussionUpdateEvent) {
    if (!this.discussion) return;
    try {
      const data = await discussionRepository.update(
        this.discussion.id,
        e.theme
      );
      this.discussion = data;
      this._isEditing = false;
      showToast(this, "Theme updated.", "success", 2000);

      this.dispatchEvent(new DiscussionUpdatedEvent(data));
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
        @request-edit-discussion=${() => (this._isEditing = true)}
        @discussion-update=${this._handleUpdateDiscussion}
        @cancel-edit-discussion=${() => (this._isEditing = false)}
      ></learning-discussion-detail>
    `;
  }

  static styles = [baseStyle];
}
