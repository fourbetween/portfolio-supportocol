import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { client } from "../api/client";
import type { Discussion } from "../model/discussion";
import "../ui/discussion-detail/discussion-detail";

@customElement("learning-discussion-detail-widget")
export class LearningDiscussionDetailWidget extends LitElement {
  @property({ type: Object })
  discussion?: Discussion;

  @state()
  private isEditing = false;

  private async handleSave(theme: string) {
    if (!this.discussion) return;
    const { data, error } = await client.PUT(
      "/learning/discussions/{discussionId}",
      {
        params: {
          path: { discussionId: this.discussion.id },
        },
        body: { theme },
      }
    );
    if (error) {
      showToast(this, "Failed to update theme.", "error");
      return;
    }
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
