import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import "../../../../shared/ui/popup/popup";
import { LearningDiscussionUpdateStatusEvent } from "../../event/discussion";
import type { Discussion } from "../../model/discussion";

@customElement("learning-discussion-status-popup")
export class DiscussionStatusPopup extends LitElement {
  @property({ type: Boolean })
  open = false;

  @property({ type: String })
  status: Discussion["status"] = "private";

  private _handleAction() {
    if (this.status === "private") {
      this.dispatchEvent(new LearningDiscussionUpdateStatusEvent("public"));
    } else {
      this.dispatchEvent(new LearningDiscussionUpdateStatusEvent("private"));
    }
    this._handleClose();
  }

  private _handleClose() {
    this.open = false;
  }

  render() {
    const isPrivate = this.status === "private";
    const title = isPrivate ? "Confirm Publication" : "Confirm Unpublication";
    const message = isPrivate
      ? "Do you want to publish this discussion?"
      : "Do you want to unpublish this discussion?";
    const actionLabel = isPrivate ? "Publish" : "Unpublish";

    return html`
      <ui-popup .open=${this.open} @close=${this._handleClose}>
        <div slot="header">${title}</div>
        <div slot="main">${message}</div>
        <div slot="footer">
          <button class="btn" @click=${this._handleClose}>Cancel</button>
          <button class="btn btn-primary" @click=${this._handleAction}>
            ${actionLabel}
          </button>
        </div>
      </ui-popup>
    `;
  }

  static styles = [baseStyle, buttonStyle];
}
