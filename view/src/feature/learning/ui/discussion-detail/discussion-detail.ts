import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import type { Discussion } from "../../model/discussion";

@customElement("learning-discussion-detail")
export class LearningDiscussionDetail extends LitElement {
  @property({ type: Object })
  discussion?: Discussion;

  @property({ type: Boolean })
  isEditing = false;

  @property({ attribute: false })
  onEdit?: () => void;

  @property({ attribute: false })
  onSave?: (theme: string) => void;

  @property({ attribute: false })
  onCancel?: () => void;

  @query("input")
  private inputElement?: HTMLInputElement;

  render() {
    return html`
      <div class="container">
        <div class="header">
          ${this.isEditing
            ? html`
                <div class="edit-form">
                  <input
                    type="text"
                    class="theme-input"
                    .value=${this.discussion?.theme ?? ""}
                    placeholder="議論のテーマを入力"
                  />
                  <div class="actions">
                    <button
                      class="btn btn-primary"
                      @click=${() =>
                        this.onSave?.(this.inputElement?.value ?? "")}
                    >
                      保存
                    </button>
                    <button class="btn" @click=${() => this.onCancel?.()}>
                      キャンセル
                    </button>
                  </div>
                </div>
              `
            : html`
                <div class="display">
                  <h1 class="theme">${this.discussion?.theme}</h1>
                  <button class="btn" @click=${() => this.onEdit?.()}>
                    <span class="material-icons">edit</span>
                    編集
                  </button>
                </div>
              `}
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    css`
      .container {
        padding: 16px;
        border-bottom: 1px solid var(--color-border-default);
        background-color: var(--color-canvas-default);
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .display {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .theme {
        font-size: 32px;
        font-weight: 600;
        margin: 0;
      }

      .edit-form {
        width: 100%;
      }

      .theme-input {
        width: 100%;
        font-size: 32px;
        font-weight: 600;
        padding: 8px;
        margin-bottom: 8px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-subtle);
      }

      .actions {
        display: flex;
        gap: 8px;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 16px;
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
        white-space: nowrap;
        vertical-align: middle;
        cursor: pointer;
        user-select: none;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        appearance: none;
        background-color: var(--color-btn-bg);
        color: var(--color-btn-text);
      }

      .btn:hover {
        background-color: var(--color-btn-hover-bg);
      }

      .btn-primary {
        color: var(--color-btn-primary-text);
        background-color: var(--color-btn-primary-bg);
        border-color: var(--color-btn-primary-border);
      }

      .btn-primary:hover {
        background-color: var(--color-btn-primary-hover-bg);
      }

      .material-icons {
        font-size: 16px;
      }
    `,
  ];
}
