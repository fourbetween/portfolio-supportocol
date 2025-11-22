import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { CommentType } from "../../../../model/rule";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";
import "../base";
import type { BasePopupPresenter } from "../base";

@customElement("create-comment-popup-presenter")
export class CreateCommentPopupPresenter extends LitElement {
  @property({ type: Array })
  commentTypes: CommentType[] = [];

  @query("base-popup-presenter")
  private basePopup!: BasePopupPresenter;

  open() {
    this.basePopup.open();
  }

  close() {
    this.basePopup.close();
  }

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">コメント投稿</span>
        <div slot="main">
          <form>
            <div class="form-group">
              <label for="type" class="form-label">コメント種類</label>
              <select id="type" class="form-control">
                ${this.commentTypes.map(
                  (type) =>
                    html`
                      <option value="${type.id}">${type.name}</option>
                    `
                )}
              </select>
            </div>
            <div class="form-group">
              <label for="content" class="form-label">内容</label>
              <textarea
                id="content"
                class="form-control"
                placeholder="コメントを入力してください..."
              ></textarea>
            </div>
          </form>
        </div>
        <div slot="footer">
          <button type="submit" class="btn btn-primary">投稿する</button>
        </div>
      </base-popup-presenter>
    `;
  }

  static styles = [formStyle, buttonStyle];
}
