import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { CommentType } from "../../../../model/discussion";
import type { Rule } from "../../../../model/rule";
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
  rule?: Rule;

  @property({ attribute: false })
  fromCommentTypeId?: string;

  @property({ attribute: false })
  onCreate?: (data: CreateCommentFormData) => void;

  private getAvailableCommentTypes(): CommentType[] {
    if (!this.rule) {
      return this.commentTypes;
    }

    // 経路の「開始コメント」は子コメント、「終了コメント」は親コメント
    // 親コメント種類（toCommentTypeId）が一致する経路を探し、
    // 許可される子コメント種類（fromCommentTypeId）を取得
    const parentTypeId = this.fromCommentTypeId ?? "";
    const allowedChildTypeIds = this.rule.commentTypePaths
      .filter((path) => path.parentCommentTypeId === parentTypeId)
      .map((path) => path.childCommentTypeId);

    return this.commentTypes.filter((type) =>
      allowedChildTypeIds.includes(type.id)
    );
  }

  render() {
    const title = this.parentCommentId ? "コメントを返信" : "コメントを追加";
    const availableCommentTypes = this.getAvailableCommentTypes();

    return html`
      <base-popup-presenter>
        <span slot="header">${title}</span>
        <div slot="main">
          <div class="form-group">
            <label for="comment-type">コメント種類</label>
            <select id="comment-type">
              <option value="">選択してください</option>
              ${availableCommentTypes.map(
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
