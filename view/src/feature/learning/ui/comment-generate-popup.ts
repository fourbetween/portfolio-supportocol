import { msg } from "@lit/localize";
import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import "../../../shared/ui/icons/icon-psychology";
import "../../../shared/ui/popup/popup";
import type { CommentFrame } from "../model/comment-frame";
import { LearningDiscussionCommentGenerateEvent } from "../event/discussion";
import "./discussion-add-form";
import type { LearningDiscussionAddForm } from "./discussion-add-form";

@customElement("learning-comment-generate-popup")
export class LearningCommentGeneratePopup extends LitElement {
  @property({ type: Boolean })
  open = false;

  @property({ type: Object })
  initialFrame?: CommentFrame | null;

  @property({ type: Object })
  usedFrame?: CommentFrame;

  @query("learning-discussion-add-form")
  private _form!: LearningDiscussionAddForm;

  private _handleClose() {
    this.open = false;
  }

  private _handleGenerate() {
    if (!this._form.isValid) return;
    const { sourceText, sourceUrls, modelLevel, commentFrame } =
      this._form.value;
    this.dispatchEvent(
      new LearningDiscussionCommentGenerateEvent(
        sourceText ?? "",
        sourceUrls ?? [],
        modelLevel ?? "medium",
        commentFrame,
      ),
    );
    this._form.reset();
    this.open = false;
  }

  render() {
    return html`
      <ui-popup .open=${this.open} @popup-closed=${this._handleClose}>
        <div slot="header">${msg("Generate Comments")}</div>
        <div slot="main">
          <learning-discussion-add-form
            .isFree=${false}
            .hideTheme=${true}
            .initialFrame=${this.initialFrame}
            .usedFrame=${this.usedFrame}
          ></learning-discussion-add-form>
        </div>
        <div slot="footer">
          <button class="btn" @click=${this._handleClose}>
            ${msg("Cancel")}
          </button>
          <button class="btn btn-primary" @click=${this._handleGenerate}>
            <ui-icon-psychology></ui-icon-psychology>
            ${msg("Generate")}
          </button>
        </div>
      </ui-popup>
    `;
  }

  static styles = [baseStyle, buttonStyle];
}
