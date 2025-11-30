import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { CommentType } from "../../../../model/discussion";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";
import type { BasePopupPresenter } from "../base";

export interface CreateCommentFormData {
  commentTypeId: string;
  content: string;
}

@customElement("create-comment-popup-presenter")
export class CreateCommentPopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private popup!: BasePopupPresenter;

  @query("#comment-type")
  private typeSelect!: HTMLSelectElement;

  @query("#comment-content")
  private contentTextarea!: HTMLTextAreaElement;

  @property({ attribute: false })
  commentTypes: CommentType[] = [];

  @property({ attribute: false })
  parentCommentId: string | null = null;

  @property({ attribute: false })
  onCreate?: (data: CreateCommentFormData) => void;

  render() {
    const title = this.parentCommentId ? "コメントを返信" : "コメントを追加";

    return html`
      <base-popup-presenter>
        <span slot="header">${title}</span>
        <div slot="main">
          <div class="form-group">
            <label for="comment-type">コメント種類</label>
            <select id="comment-type">
              <option value="">選択してください</option>
              ${this.commentTypes.map(
                (type) => html`
                  <option value="${type.id}">${type.name}</option>
                `
              )}
            </select>
          </div>
          <div class="form-group">
            <label for="comment-content">内容</label>
            <textarea
              id="comment-content"
              placeholder="コメント内容を入力"
              rows="5"
            ></textarea>
          </div>
        </div>
        <div slot="footer">
          <button class="btn-secondary" @click=${this.handleCancel}>
            キャンセル
          </button>
          <button class="btn-primary" @click=${this.handleCreate}>作成</button>
        </div>
      </base-popup-presenter>
    `;
  }

  open() {
    this.openWithContent("");
  }

  openWithContent(content: string) {
    this.typeSelect.value = "";
    this.contentTextarea.value = content;
    this.popup.open();
  }

  close() {
    this.popup.close();
  }

  private handleCreate() {
    const commentTypeId = this.typeSelect.value;
    const content = this.contentTextarea.value.trim();

    if (!commentTypeId || !content) {
      return;
    }

    this.onCreate?.({ commentTypeId, content });
    this.close();
  }

  private handleCancel() {
    this.close();
  }

  static styles = [baseStyle, buttonStyle, formStyle];
}
