import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import type {
  CommentTypeFormData,
  CommentTypeFormPresenter,
} from "../../form/rule/comment_type";
import type { BasePopupPresenter } from "../base";

@customElement("add-comment-type-popup-presenter")
export class AddCommentTypePopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private basePopup!: BasePopupPresenter;

  @query("comment-type-form-presenter")
  private form!: CommentTypeFormPresenter;

  open() {
    this.form.name = "";
    this.form.description = "";
    this.form.selectedColorIndex = 0;
    this.basePopup.open();
  }

  close() {
    this.basePopup.close();
  }

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">コメント種類の追加</span>
        <div slot="main">
          <comment-type-form-presenter></comment-type-form-presenter>
        </div>
        <div slot="footer">
          <button class="btn-secondary" @click=${() => this.basePopup.close()}>
            キャンセル
          </button>
          <button class="btn-primary" @click=${this.handleAdd}>追加</button>
        </div>
      </base-popup-presenter>
    `;
  }

  private handleAdd() {
    const formData: CommentTypeFormData = this.form.getFormData();
    this.dispatchEvent(
      new CustomEvent("add", {
        bubbles: true,
        composed: true,
        detail: formData,
      })
    );
    this.basePopup.close();
  }

  static styles = [baseStyle, buttonStyle];
}
