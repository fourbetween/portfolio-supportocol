import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import "../../../../shared/ui/popup/popup";
import { LearningDiscussionUpdateCommentFrameEvent } from "../../event/discussion";
import type { CommentFrame } from "../../model/comment-frame";
import "../comment-frame-form/comment-frame-form";
import type { LearningCommentFrameForm } from "../comment-frame-form/comment-frame-form";

@customElement("learning-comment-frame-popup")
export class LearningCommentFramePopup extends LitElement {
  @property({ type: Boolean })
  open = false;

  @property({ type: Object })
  initialFrame?: CommentFrame;

  @property({ type: Object })
  usedFrame?: CommentFrame;

  @query("learning-comment-frame-form")
  private _form!: LearningCommentFrameForm;

  private _handleClose() {
    this.open = false;
  }

  private _handleSave() {
    const frame = this._form.value;
    this.dispatchEvent(new LearningDiscussionUpdateCommentFrameEvent(frame));
    this._handleClose();
  }

  render() {
    return html`
      <ui-popup .open=${this.open} @popup-closed=${this._handleClose}>
        <div slot="header">Edit Comment Frame</div>
        <div slot="main">
          <learning-comment-frame-form
            .initialFrame=${this.initialFrame}
            .usedFrame=${this.usedFrame}
          ></learning-comment-frame-form>
        </div>
        <div slot="footer">
          <button class="btn" @click=${this._handleClose}>Cancel</button>
          <button class="btn btn-primary" @click=${this._handleSave}>
            Save
          </button>
        </div>
      </ui-popup>
    `;
  }

  static styles = [baseStyle, buttonStyle];
}
