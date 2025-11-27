import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type {
  CommentPermissionLevel,
  VisibilityLevel,
} from "../../../../model/discussion";
import type { Rule } from "../../../../model/rule";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";

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
      <main class="container">
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
    css`
      :host {
        display: block;
        min-height: 100vh;
        background-color: var(--color-canvas-default);
      }

      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 24px;
      }

      h1 {
        font-size: 32px;
        font-weight: 700;
        color: var(--color-fg-default);
        margin: 0 0 24px 0;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      label {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-fg-default);
      }

      input[type="text"],
      textarea,
      select {
        padding: 8px 12px;
        font-size: 14px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
        color: var(--color-fg-default);
      }

      input[type="text"]:focus,
      textarea:focus,
      select:focus {
        outline: none;
        border-color: var(--color-accent-fg);
        box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.3);
      }

      textarea {
        resize: vertical;
      }

      .form-actions {
        margin-top: 16px;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
    `,
  ];
}
