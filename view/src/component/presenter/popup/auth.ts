import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";
import { buttonStyle } from "../../../style/button";
import { formStyle } from "../../../style/form";
import type { BasePopupPresenter } from "./base";

export type AuthMode = "login" | "signup";

@customElement("auth-popup-presenter")
export class AuthPopupPresenter extends LitElement {
  @property({ type: String })
  mode: AuthMode = "login";

  @property({ type: Boolean })
  selfSignupEnabled = false;

  @property({ type: String })
  errorMessage = "";

  @property({ attribute: false })
  onSwitchMode?: (mode: AuthMode) => void;

  @property({ attribute: false })
  onLogin?: (email: string, password: string) => void;

  @property({ attribute: false })
  onSignup?: (email: string, password: string) => void;

  @state()
  private validationErrorMessage = "";

  @query("base-popup-presenter")
  private basePopup!: BasePopupPresenter;

  get googleButtonContainer(): HTMLElement | null {
    return this.renderRoot.querySelector(".google-button-container");
  }

  open() {
    this.basePopup.open();
  }

  close() {
    this.basePopup.close();
  }

  private handleSwitchClick(e: Event) {
    e.preventDefault();
    const newMode = this.mode === "login" ? "signup" : "login";
    this.onSwitchMode?.(newMode);
  }

  private renderSwitchPrompt() {
    if (this.mode === "login") {
      if (!this.selfSignupEnabled) return "";
      return html`
        アカウントをお持ちでない方は
        <a href="#" class="switch-link" @click=${this.handleSwitchClick}>
          新規登録
        </a>
      `;
    } else {
      return html`
        すでにアカウントをお持ちの方は
        <a href="#" class="switch-link" @click=${this.handleSwitchClick}>
          ログイン
        </a>
      `;
    }
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    this.validationErrorMessage = "";

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    if (this.mode === "login") {
      this.onLogin?.(email, password);
    } else {
      const passwordConfirm = (
        form.elements.namedItem("passwordConfirm") as HTMLInputElement
      ).value;

      if (password !== passwordConfirm) {
        this.validationErrorMessage = "パスワードが一致しません";
        return;
      }

      const hasLowerCase = /[a-z]/.test(password);
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);

      if (!hasLowerCase || !hasUpperCase || !hasNumber) {
        this.validationErrorMessage =
          "パスワードには小文字、大文字、数字を含める必要があります";
        return;
      }

      this.onSignup?.(email, password);
    }
  }

  private renderForm() {
    if (!this.selfSignupEnabled) return "";

    return html`
      <form class="auth-form" @submit=${this.handleSubmit}>
        <div class="form-group">
          <label for="email">メールアドレス</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="メールアドレスを入力"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">パスワード</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="${this.mode === "signup"
              ? "パスワードを入力（8文字以上）"
              : "パスワードを入力"}"
            required
          />
        </div>
        ${this.mode === "signup"
          ? html`
              <div class="form-group">
                <label for="passwordConfirm">パスワード（確認）</label>
                <input
                  type="password"
                  name="passwordConfirm"
                  id="passwordConfirm"
                  placeholder="パスワードを再入力"
                  minlength="8"
                  required
                />
              </div>
            `
          : ""}
        <button type="submit" class="submit-button button button--primary">
          ${this.mode === "login" ? "ログイン" : "新規登録"}
        </button>
      </form>
      <div class="divider">
        <span>または</span>
      </div>
    `;
  }

  render() {
    const displayedErrorMessage =
      this.validationErrorMessage || this.errorMessage;

    return html`
      <base-popup-presenter>
        <span slot="header" class="popup-title">
          ${this.mode === "login" ? "ログイン" : "新規登録"}
        </span>
        <div slot="main" class="popup-content">
          ${displayedErrorMessage
            ? html`
                <div class="error-message">${displayedErrorMessage}</div>
              `
            : ""}
          ${this.renderForm()}
          <div class="google-button-container"></div>
          <p class="switch-prompt">${this.renderSwitchPrompt()}</p>
        </div>
      </base-popup-presenter>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    formStyle,
    css`
      base-popup-presenter {
        --popup-max-width: 400px;
      }

      .popup-title {
        font-size: 20px;
        font-weight: 600;
        color: #1f2328;
      }

      .error-message {
        background-color: #ffebe9;
        border: 1px solid #ff818266;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 16px;
        color: #cf222e;
        font-size: 14px;
      }

      .submit-button {
        margin-top: 8px;
      }

      .submit-button.button {
        --button-padding: 10px 16px;
      }

      .divider {
        display: flex;
        align-items: center;
        margin: 24px 0;
        color: #656d76;
        font-size: 12px;
      }

      .divider::before,
      .divider::after {
        content: "";
        flex: 1;
        height: 1px;
        background-color: #d0d7de;
      }

      .divider span {
        padding: 0 12px;
      }

      .google-button-container {
        display: flex;
        justify-content: center;
        margin-top: 24px;
        margin-bottom: 24px;
      }

      .switch-prompt {
        margin-top: 24px;
        text-align: center;
        font-size: 12px;
        color: #656d76;
      }
      .switch-prompt:empty {
        display: none;
      }

      .switch-link {
        color: #0969da;
        text-decoration: none;
      }

      .switch-link:hover {
        text-decoration: underline;
      }
    `,
  ];
}
