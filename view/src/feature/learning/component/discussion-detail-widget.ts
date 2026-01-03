import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
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

  private async handleSave(theme: string) {
    if (!this.discussion) return;
    try {
      const data = await discussionRepository.update(this.discussion.id, theme);
      this.discussion = data;
      this.isEditing = false;
      showToast(this, "Theme updated.", "success", 2000);

      this.dispatchEvent(
        new CustomEvent("discussion-updated", {
          detail: data,
          bubbles: true,
          composed: true,
        })
      );
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
        .onEdit=${() => (this.isEditing = true)}
        .onSave=${(theme: string) => this.handleSave(theme)}
        .onCancel=${() => (this.isEditing = false)}
      ></learning-discussion-detail>
    `;
  }

  static styles = [baseStyle, css``];
}
