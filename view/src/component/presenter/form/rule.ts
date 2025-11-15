import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { CommentType, CommentTypePath, Rule } from "../../../model/rule";
import { baseStyle } from "../../../style/base";

@customElement("rule-form-presenter")
export class RuleFormPresenter extends LitElement {
  @property({ type: Object })
  rule: Partial<Rule> = {
    name: "",
    description: "",
  };

  @property({ type: Array })
  commentTypes: CommentType[] = [];

  @property({ type: Array })
  commentTypePaths: CommentTypePath[] = [];

  render() {
    return html`
      <div class="rule-form">
        <!-- Rule Basic Info -->
        <section class="form-section">
          <h2 class="section-title">
            <span class="section-icon">info</span>
            基本情報
          </h2>
          <div class="form-fields">
            <div class="form-field">
              <label for="rule-name">
                ルール名
                <span class="required">*</span>
              </label>
              <input
                id="rule-name"
                type="text"
                class="form-input"
                placeholder="例: 標準的な議論フロー"
                aria-label="ルール名"
                .value=${this.rule.name || ""}
                @input=${this._handleNameInput}
              />
            </div>
            <div class="form-field">
              <label for="rule-description">説明</label>
              <textarea
                id="rule-description"
                class="form-textarea"
                placeholder="このルールの目的や使い方を説明してください"
                aria-label="説明"
                .value=${this.rule.description || ""}
                @input=${this._handleDescriptionInput}
              ></textarea>
            </div>
          </div>
        </section>

        <div class="section-divider"></div>

        <!-- Comment Types Section -->
        <section class="form-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="section-icon">label</span>
              コメント種類
            </h2>
            <button
              type="button"
              class="add-button"
              @click=${this._handleAddCommentType}
            >
              <span class="button-icon">add</span>
              種類を追加
            </button>
          </div>

          ${this.commentTypes.length > 0
            ? html`
                <div class="comment-types-list">
                  ${this.commentTypes.map(
                    (type) => html`
                      <div class="comment-type-item">
                        <div class="drag-handle">
                          <span class="handle-icon">drag_indicator</span>
                        </div>
                        <div class="comment-type-content">
                          <div class="comment-type-fields">
                            <div class="field-group">
                              <label class="field-label">名前</label>
                              <input
                                type="text"
                                class="field-input"
                                placeholder="例: 主張"
                                value=${type.name}
                              />
                            </div>
                            <div class="field-group">
                              <label class="field-label">カラー</label>
                              <div class="color-input-group">
                                <input
                                  type="text"
                                  class="field-input color-text"
                                  placeholder="#0969DA"
                                  .value=${type.color}
                                />
                                <input
                                  type="color"
                                  class="color-picker"
                                  .value=${type.color}
                                />
                              </div>
                            </div>
                          </div>
                          <div class="field-group">
                            <label class="field-label">説明</label>
                            <textarea
                              class="field-textarea"
                              placeholder="このコメント種類の説明"
                              .value=${type.description}
                            ></textarea>
                          </div>
                        </div>
                        <button
                          type="button"
                          class="delete-button"
                          aria-label="削除"
                        >
                          <span class="button-icon">delete</span>
                        </button>
                      </div>
                    `
                  )}
                </div>
              `
            : ""}
        </section>

        <div class="section-divider"></div>

        <!-- Comment Paths Section -->
        <section class="form-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="section-icon">timeline</span>
              コメント経路
            </h2>
            <button
              type="button"
              class="add-button path-button"
              @click=${this._handleAddCommentPath}
            >
              <span class="button-icon">add</span>
              経路を追加
            </button>
          </div>

          ${this.commentTypePaths.length > 0
            ? html`
                <div class="comment-paths-list">
                  ${this.commentTypePaths.map(
                    (path) => html`
                      <div class="comment-path-item">
                        <div class="drag-handle">
                          <span class="handle-icon">drag_indicator</span>
                        </div>
                        <div class="comment-path-content">
                          <div class="path-field">
                            <label class="field-label">開始</label>
                            <select class="path-select">
                              ${this.commentTypes.map(
                                (type) => html`
                                  <option
                                    value=${type.id}
                                    ?selected=${type.id ===
                                    path.fromCommentTypeId}
                                  >
                                    ${type.name}
                                  </option>
                                `
                              )}
                            </select>
                          </div>
                          <div class="arrow-icon">
                            <span class="button-icon">arrow_forward</span>
                          </div>
                          <div class="path-field">
                            <label class="field-label">終了</label>
                            <select class="path-select">
                              ${this.commentTypes.map(
                                (type) => html`
                                  <option
                                    value=${type.id}
                                    ?selected=${type.id ===
                                    path.toCommentTypeId}
                                  >
                                    ${type.name}
                                  </option>
                                `
                              )}
                            </select>
                          </div>
                        </div>
                        <button
                          type="button"
                          class="delete-button"
                          aria-label="削除"
                        >
                          <span class="button-icon">delete</span>
                        </button>
                      </div>
                    `
                  )}
                </div>
              `
            : ""}
        </section>
      </div>
    `;
  }

  private _handleNameInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.rule = { ...this.rule, name: input.value };
    this.dispatchEvent(
      new CustomEvent("rule-change", {
        detail: this.rule,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleDescriptionInput(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    this.rule = { ...this.rule, description: textarea.value };
    this.dispatchEvent(
      new CustomEvent("rule-change", {
        detail: this.rule,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleAddCommentType() {
    this.dispatchEvent(
      new CustomEvent("add-comment-type", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleAddCommentPath() {
    this.dispatchEvent(
      new CustomEvent("add-comment-path", {
        bubbles: true,
        composed: true,
      })
    );
  }

  static styles = [
    baseStyle,
    css`
      .rule-form {
        width: 100%;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .form-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .section-title {
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .section-icon {
        font-family: "Material Symbols Outlined";
        font-size: 1.25rem;
        color: #3b82f6;
      }

      .form-fields {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #1f2937;
      }

      .required {
        color: #ef4444;
      }

      .form-input {
        width: 100%;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        color: #1f2937;
        background: #f9fafb;
      }

      .form-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      }

      .form-input::placeholder {
        color: #9ca3af;
      }

      .form-textarea {
        width: 100%;
        min-height: 80px;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        color: #1f2937;
        background: #f9fafb;
        resize: none;
        font-family: inherit;
      }

      .form-textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      }

      .form-textarea::placeholder {
        color: #9ca3af;
      }

      .section-divider {
        border-top: 1px solid #d1d5db;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .add-button {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.75rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        background: #10b981;
        color: white;
        border: none;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .add-button:hover {
        background: #059669;
      }

      .button-icon {
        font-family: "Material Symbols Outlined";
        font-size: 1rem;
      }

      .comment-types-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
      }

      .comment-type-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        border-radius: 0.5rem;
        background: #f9fafb;
        border: 1px solid #d1d5db;
        transition: border-color 0.2s ease;
      }

      .comment-type-item:hover {
        border-color: #3b82f6;
      }

      .drag-handle {
        flex-shrink: 0;
        padding-top: 0.25rem;
        cursor: grab;
      }

      .handle-icon {
        font-family: "Material Symbols Outlined";
        font-size: 1.25rem;
        color: #9ca3af;
      }

      .comment-type-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .comment-type-fields {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      @media (max-width: 768px) {
        .comment-type-fields {
          grid-template-columns: 1fr;
        }
      }

      .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .field-label {
        font-size: 0.75rem;
        font-weight: 500;
        color: #6b7280;
      }

      .field-input {
        width: 100%;
        padding: 0.375rem 0.625rem;
        font-size: 0.875rem;
        border: 1px solid #d1d5db;
        border-radius: 0.25rem;
        color: #1f2937;
        background: #ffffff;
      }

      .field-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      }

      .color-input-group {
        display: flex;
        gap: 0.5rem;
      }

      .color-text {
        flex: 1;
        font-family: monospace;
      }

      .color-picker {
        width: 3rem;
        height: 2.25rem;
        border-radius: 0.25rem;
        border: 1px solid #d1d5db;
        cursor: pointer;
      }

      .field-textarea {
        width: 100%;
        min-height: 60px;
        padding: 0.375rem 0.625rem;
        font-size: 0.875rem;
        border: 1px solid #d1d5db;
        border-radius: 0.25rem;
        color: #1f2937;
        background: #ffffff;
        resize: none;
        font-family: inherit;
      }

      .field-textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      }

      .delete-button {
        flex-shrink: 0;
        padding: 0.375rem;
        border-radius: 0.25rem;
        color: #ef4444;
        background: transparent;
        border: none;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s ease;
      }

      .comment-type-item:hover .delete-button {
        opacity: 1;
      }

      .delete-button:hover {
        background: rgba(239, 68, 68, 0.1);
      }

      .path-button {
        background: #8b5cf6;
      }

      .path-button:hover {
        background: #7c3aed;
      }

      .comment-paths-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
      }

      .comment-path-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-radius: 0.5rem;
        background: #f9fafb;
        border: 1px solid #d1d5db;
        transition: border-color 0.2s ease;
      }

      .comment-path-item:hover {
        border-color: #8b5cf6;
      }

      .comment-path-content {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .path-field {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .path-select {
        width: 100%;
        padding: 0.375rem 0.625rem;
        font-size: 0.875rem;
        border: 1px solid #d1d5db;
        border-radius: 0.25rem;
        color: #1f2937;
        background: #ffffff;
        cursor: pointer;
      }

      .path-select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      }

      .arrow-icon {
        flex-shrink: 0;
        padding-top: 1.5rem;
        color: #8b5cf6;
        font-size: 1.5rem;
      }
    `,
  ];
}
