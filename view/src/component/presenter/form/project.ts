import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";
import { iconStyle } from "../../../style/icon";

@customElement("project-form-presenter")
export class ProjectFormPresenter extends LitElement {
  render() {
    return html`
      <form class="project-form">
        <!-- Project Details -->
        <div class="form-section">
          <h2 class="form-section-title">
            <span class="material-symbols-outlined section-icon">info</span>
            基本情報
          </h2>
          <div class="form-fields">
            <!-- Project Name -->
            <div class="form-field">
              <label class="field-label" for="name">
                プロジェクト名
                <span class="required-mark">*</span>
              </label>
              <input
                class="field-input"
                id="name"
                placeholder="例: Webアプリケーション開発"
                type="text"
                required
              />
              <p class="field-help">
                プロジェクトを識別しやすい名前を入力してください
              </p>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" class="button-cancel">キャンセル</button>
          <div class="action-group">
            <button type="submit" class="button-submit">
              <span class="material-symbols-outlined button-icon">add</span>
              プロジェクトを作成
            </button>
          </div>
        </div>
      </form>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    css`
      .project-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1rem;
      }

      .form-section {
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 1rem;
      }

      .form-section-title {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #333333;
      }

      .section-icon {
        font-size: 20px;
        color: #1976d2;
      }

      .form-fields {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .form-field {
        display: flex;
        flex-direction: column;
      }

      .field-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: #333333;
      }

      .required-mark {
        color: #d32f2f;
      }

      .field-input {
        width: 100%;
        border-radius: 8px;
        color: #333333;
        background: #ffffff;
        border: 1px solid #e0e0e0;
        padding: 0.75rem;
        font-size: 0.875rem;
      }

      .field-input:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
      }

      .field-input::placeholder {
        color: #757575;
      }

      .field-help {
        font-size: 0.75rem;
        color: #757575;
        margin: 0.25rem 0 0 0;
      }

      .form-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        border-top: 1px solid #e0e0e0;
      }

      .action-group {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .button-cancel {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        color: #757575;
        background: transparent;
        border: 1px solid #e0e0e0;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .button-cancel:hover {
        background: #f5f5f5;
      }

      .button-submit {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1.5rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        background: #2e7d32;
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      }

      .button-submit:hover {
        background: #1b5e20;
      }

      .button-icon {
        font-size: 18px;
      }
    `,
  ];
}
