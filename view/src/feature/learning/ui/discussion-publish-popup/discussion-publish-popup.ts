import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import "../../../../shared/ui/popup/popup";
import { LearningDiscussionPublishEvent } from "../../event/discussion";

@customElement("learning-discussion-publish-popup")
export class DiscussionPublishPopup extends LitElement {
  @property({ type: Boolean })
  open = false;

  private _handlePublish() {
    this.dispatchEvent(new LearningDiscussionPublishEvent());
    this._handleClose();
  }

  private _handleClose() {
    this.open = false;
  }

  render() {
    return html`
      <ui-popup .open=${this.open} @close=${this._handleClose}>
        <div slot="header">Confirm Publication</div>
        <div slot="main">Do you want to publish this discussion?</div>
        <div slot="footer">
          <button class="btn" @click=${this._handleClose}>Cancel</button>
          <button class="btn btn-primary" @click=${this._handlePublish}>
            Publish
          </button>
        </div>
      </ui-popup>
    `;
  }

  static styles = [baseStyle, buttonStyle];
}
