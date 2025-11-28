import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type {
  CommentPermissionLevel,
  VisibilityLevel,
} from "../../../../model/discussion";
import type { Rule } from "../../../../model/rule";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";
import {
  formActionsStyle,
  pageContainerStyle,
  pageHeadingStyle,
  pageHostStyle,
} from "../../../../style/page";

export interface CreateDiscussionFormData {
  theme: string;
  background: string;
  conclusion: string;
  ruleId: string;
  visibilityLevel: VisibilityLevel;
  commentPermissionLevel: CommentPermissionLevel;
}

@customElement("create-discussion-page-presenter")
export class CreateDiscussionPagePresenter extends LitElement {
  @property({ attribute: false })
  rules: Rule[] = [];

  @property({ attribute: false })
  onSubmit?: (data: CreateDiscussionFormData) => void;

  @property({ attribute: false })
  onCancel?: () => void;

  private handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    this.onSubmit?.({
      theme: formData.get("theme") as string,
      background: formData.get("background") as string,
      conclusion: formData.get("conclusion") as string,
      ruleId: formData.get("ruleId") as string,
      visibilityLevel: formData.get("visibilityLevel") as VisibilityLevel,
      commentPermissionLevel: formData.get(
        "commentPermissionLevel"
      ) as CommentPermissionLevel,
    });
  }

  private handleCancel() {
    this.onCancel?.();
  }

  render() {
    return html`
      <main class="container container--narrow">
        <h1>新規議論作成</h1>
        <form @submit=${this.handleSubmit}>
          <div class="form-group">
            <label for="theme">テーマ</label>
            <input type="text" id="theme" name="theme" required />
          </div>
          <div class="form-group">
            <label for="background">背景</label>
            <textarea id="background" name="background" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label for="conclusion">結論（初期案）</label>
            <textarea id="conclusion" name="conclusion" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label for="ruleId">ルール</label>
            <select id="ruleId" name="ruleId" required>
              <option value="">選択してください</option>
              ${this.rules.map(
                (rule) => html`
                  <option value=${rule.id}>${rule.name}</option>
                `
              )}
            </select>
          </div>
          <div class="form-group">
            <label for="visibilityLevel">公開レベル</label>
            <select id="visibilityLevel" name="visibilityLevel" required>
              <option value="everyone">全員</option>
              <option value="authenticated">ログインユーザー</option>
              <option value="owner">自分のみ</option>
            </select>
          </div>
          <div class="form-group">
            <label for="commentPermissionLevel">コメント許可レベル</label>
            <select
              id="commentPermissionLevel"
              name="commentPermissionLevel"
              required
            >
              <option value="everyone">全員</option>
              <option value="authenticated">ログインユーザー</option>
              <option value="owner">自分のみ</option>
            </select>
          </div>
          <div class="form-actions">
            <button
              type="button"
              class="btn-secondary"
              @click=${this.handleCancel}
            >
              キャンセル
            </button>
            <button type="submit" class="btn-primary">作成</button>
          </div>
        </form>
      </main>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    formStyle,
    pageHostStyle,
    pageContainerStyle,
    pageHeadingStyle,
    formActionsStyle,
  ];
}
