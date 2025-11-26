import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { CommentType } from "../../../../model/rule";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import {
  CommentTypeFormPresenter,
  type CommentTypeFormData,
} from "../../form/rule/comment_type";
import type { BasePopupPresenter } from "../base";

@customElement("edit-comment-type-popup-presenter")
export class EditCommentTypePopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private basePopup!: BasePopupPresenter;

  @query("comment-type-form-presenter")
  private form!: CommentTypeFormPresenter;

  @property({ attribute: false })
  commentType: CommentType | null = null;

  open(commentType: CommentType) {
    this.commentType = commentType;
    this.form.name = commentType.name;
    this.form.description = commentType.description;
    this.form.selectedColorIndex = CommentTypeFormPresenter.COLORS.indexOf(
      commentType.color
    );
    if (this.form.selectedColorIndex === -1) {
      this.form.selectedColorIndex = 0;
    }
    this.basePopup.open();
  }

  close() {
    this.basePopup.close();
  }

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">コメント種類の編集</span>
        <div slot="main">
          <comment-type-form-presenter></comment-type-form-presenter>
        </div>
        <div slot="footer">
          <button class="btn-secondary" @click=${() => this.basePopup.close()}>
            キャンセル
          </button>
          <button class="btn-primary" @click=${this.handleUpdate}>更新</button>
        </div>
      </base-popup-presenter>
    `;
  }

  private handleUpdate() {
    if (!this.commentType) return;

    const formData: CommentTypeFormData = this.form.getFormData();
    this.dispatchEvent(
      new CustomEvent("update", {
        bubbles: true,
        composed: true,
        detail: {
          id: this.commentType.id,
          ...formData,
        },
      })
    );
    this.basePopup.close();
  }

  static styles = [baseStyle, buttonStyle];
}
