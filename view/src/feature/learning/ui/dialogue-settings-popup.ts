import { msg } from "@lit/localize";
import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import "../../../shared/ui/popup/popup";
import { LearningDiscussionUpdateDialogueSettingsEvent } from "../event/discussion";
import type { CommentFrame } from "../model/comment-frame";
import type { DialogueSettings } from "../model/discussion";
import "./dialogue-settings-form";
import type { LearningDialogueSettingsForm } from "./dialogue-settings-form";

@customElement("learning-dialogue-settings-popup")
export class LearningDialogueSettingsPopup extends LitElement {
  @property({ type: Boolean })
  open = false;

  @property({ type: Object })
  initialSettings?: DialogueSettings | null;

  @property({ type: Object })
  usedFrame?: CommentFrame;

  @query("learning-dialogue-settings-form")
  private _form!: LearningDialogueSettingsForm;

  private _handleClose() {
    this.open = false;
  }

  private _handleSave() {
    const settings = this._form.value;
    this.dispatchEvent(
      new LearningDiscussionUpdateDialogueSettingsEvent(settings),
    );
    this._handleClose();
  }

  render() {
    return html`
      <ui-popup .open=${this.open} @popup-closed=${this._handleClose}>
        <div slot="header">${msg("Edit Dialogue Settings")}</div>
        <div slot="main">
          <learning-dialogue-settings-form
            .initialSettings=${this.initialSettings}
            .usedFrame=${this.usedFrame}
          ></learning-dialogue-settings-form>
        </div>
        <div slot="footer">
          <button class="btn" @click=${this._handleClose}>
            ${msg("Cancel")}
          </button>
          <button class="btn btn-primary" @click=${this._handleSave}>
            ${msg("Save")}
          </button>
        </div>
      </ui-popup>
    `;
  }

  static styles = [baseStyle, buttonStyle];
}
