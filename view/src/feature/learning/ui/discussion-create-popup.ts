import { msg } from "@lit/localize";
import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import "../../../shared/ui/icons/icon-add";
import "../../../shared/ui/popup/popup";
import { LearningDiscussionCreateEvent } from "../event/discussion";
import "./discussion-add-form";
import type { LearningDiscussionAddForm } from "./discussion-add-form";

@customElement("learning-discussion-create-popup")
export class LearningDiscussionCreatePopup extends LitElement {
  @property({ type: Boolean })
  open = false;

  @property({ type: Boolean })
  isFree = false;

  @query("learning-discussion-add-form")
  private _form!: LearningDiscussionAddForm;

  private _handleClose() {
    this.open = false;
  }

  private _handleCreate() {
    if (!this._form.isValid) return;
    const { theme, language, sourceText, sourceUrls, modelLevel, commentFrame } =
      this._form.value;
    this.dispatchEvent(
      new LearningDiscussionCreateEvent(
        theme || undefined,
        undefined,
        language,
        sourceText,
        sourceUrls,
        modelLevel,
        commentFrame,
      ),
    );
    this._form.reset();
    this.open = false;
  }

  render() {
    return html`
      <ui-popup .open=${this.open} @popup-closed=${this._handleClose}>
        <div slot="header">${msg("New Discussion")}</div>
        <div slot="main">
          <learning-discussion-add-form
            .isFree=${this.isFree}
          ></learning-discussion-add-form>
        </div>
        <div slot="footer">
          <button class="btn" @click=${this._handleClose}>
            ${msg("Cancel")}
          </button>
          <button class="btn btn-primary" @click=${this._handleCreate}>
            <ui-icon-add></ui-icon-add>
            ${msg("Create")}
          </button>
        </div>
      </ui-popup>
    `;
  }

  static styles = [baseStyle, buttonStyle];
}
