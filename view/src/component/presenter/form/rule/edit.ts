import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Rule } from "../../../../model/rule";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";

@customElement("edit-rule-form-presenter")
export class EditRuleFormPresenter extends LitElement {
  @property({ type: Object })
  rule: Rule | null = null;

  render() {
    if (!this.rule) {
      return html``;
    }

    return html`
      <div class="container">
        <div class="page-header">
          <div>
            <h1>${this.rule.name}</h1>
            <p class="header-description">ルールの詳細設定と構造定義</p>
          </div>
          <div class="header-actions">
            <button class="btn">変更を破棄</button>
            <button class="btn btn-primary">保存する</button>
          </div>
        </div>

        <!-- 基本情報 -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">基本情報</h2>
          </div>
          <div class="form-group">
            <label class="form-label" for="rule-name">ルール名</label>
            <input
              id="rule-name"
              type="text"
              class="form-control"
              .value="${this.rule.name}"
            />
          </div>
          <div class="form-group">
            <label class="form-label">説明</label>
            <textarea
              class="form-control"
              .value="${this.rule.description}"
            ></textarea>
          </div>
        </div>

        <!-- 構造定義 -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">構造定義 (コメント種類と経路)</h2>
            <a href="#" class="btn btn-sm">+ コメント種類を追加</a>
          </div>

          <p class="helper-text" style="margin-bottom: 16px">
            各コメント種類に対して、返信として許可するコメント種類（子コメント）を選択してください。
          </p>

          ${this.rule.commentTypes.map(
            (parentType) => html`
              <div class="comment-type-card">
                <div
                  class="comment-type-header"
                  style="border-left: 4px solid ${parentType.color}"
                >
                  <div class="comment-type-title">
                    <span
                      class="color-dot"
                      style="background-color: ${parentType.color}"
                    ></span>
                    ${parentType.name}
                  </div>
                  <button class="btn-danger-text">削除</button>
                </div>
                <div class="comment-type-body">
                  <div class="form-group">
                    <label class="form-label">
                      このコメントへの返信として許可するもの
                    </label>
                    <div class="checkbox-grid">
                      ${this.rule!.commentTypes.map((childType) => {
                        const isChecked = this.rule!.commentTypePaths.some(
                          (path) =>
                            path.fromCommentTypeId === parentType.id &&
                            path.toCommentTypeId === childType.id
                        );
                        return html`
                          <label class="checkbox-item">
                            <input
                              type="checkbox"
                              .checked="${isChecked}"
                              @change="${(e: Event) =>
                                this._handlePathChange(
                                  e,
                                  parentType.id,
                                  childType.id
                                )}"
                            />
                            ${childType.name}
                          </label>
                        `;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private _handlePathChange(e: Event, fromId: string, toId: string) {
    // TODO: Implement path change logic
    console.log(
      "Path changed",
      fromId,
      toId,
      (e.target as HTMLInputElement).checked
    );
  }

  static styles = [
    baseStyle,
    buttonStyle,
    formStyle,
    css`
      .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
      }

      /* Header */
      .page-header {
        margin-bottom: 24px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      h1 {
        font-size: 24px;
        font-weight: 600;
        margin: 0;
      }

      .header-description {
        color: var(--color-fg-muted);
        font-size: 14px;
        margin-top: 4px;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      /* Cards & Sections */
      .section {
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--color-border-muted);
      }

      .section-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }

      /* Comment Type Card */
      .comment-type-card {
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        margin-bottom: 16px;
        overflow: hidden;
      }

      .comment-type-header {
        padding: 12px 16px;
        background-color: #f6f8fa;
        border-bottom: 1px solid var(--color-border-default);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .comment-type-title {
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .color-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
      }

      .comment-type-body {
        padding: 16px;
      }

      .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 8px;
        margin-top: 8px;
        padding: 12px;
        background-color: var(--color-canvas-subtle);
        border-radius: 6px;
        border: 1px solid var(--color-border-muted);
      }

      .checkbox-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
      }

      .checkbox-item input[type="checkbox"] {
        margin: 0;
      }

      .helper-text {
        font-size: 12px;
        color: var(--color-fg-muted);
        margin-top: 4px;
      }

      .btn-danger-text {
        color: var(--color-danger-fg);
        border: none;
        background: none;
        padding: 4px 8px;
        cursor: pointer;
      }
      .btn-danger-text:hover {
        background-color: #ffebe9;
        text-decoration: underline;
        border-radius: 4px;
      }
    `,
  ];
}
