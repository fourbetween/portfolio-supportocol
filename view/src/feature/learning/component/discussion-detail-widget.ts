import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import {
  DiscussionUpdatedEvent,
  RequestUpdateDiscussionEvent,
} from "../event/discussion";
import type { Comment } from "../model/comment";
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
  private isEditing = false;

  private async handleSave(e: RequestUpdateDiscussionEvent) {
    if (!this.discussion) return;
    try {
      const data = await discussionRepository.update(
        this.discussion.id,
        e.theme
      );
      this.discussion = data;
      this.isEditing = false;
      showToast(this, "Theme updated.", "success", 2000);

      this.dispatchEvent(new DiscussionUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, "Failed to update theme.", "error");
    }
  }

  render() {
    if (!this.discussion) return nothing;

    return html`
      <learning-discussion-detail
        .discussion=${this.discussion}
        .isEditing=${this.isEditing}
        @request-edit-discussion=${() => (this.isEditing = true)}
        @request-update-discussion=${this.handleSave}
        @cancel-edit-discussion=${() => (this.isEditing = false)}
      ></learning-discussion-detail>
    `;
  }

  static styles = [baseStyle, css``];
}
