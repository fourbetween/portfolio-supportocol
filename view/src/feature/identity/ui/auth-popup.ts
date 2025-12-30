import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { inputStyle } from "../../../shared/style/input";
import "../../../shared/ui/popup";
import type { Popup } from "../../../shared/ui/popup";

export type AuthMode = "login" | "signup";

@customElement("identity-auth-popup")
export class IdentityAuthPopup extends LitElement {
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

  @query("ui-popup")
  private popup!: Popup;

  get googleButtonContainer(): HTMLElement | null {
    return this.renderRoot.querySelector(".google-button-container");
  }

  open() {
    this.popup.open();
  }

  close() {
    this.popup.close();
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
        Don't have an account?
        <a href="#" class="switch-link" @click=${this.handleSwitchClick}>
          Sign up
        </a>
      `;
    } else {
      return html`
        Already have an account?
        <a href="#" class="switch-link" @click=${this.handleSwitchClick}>
          Log in
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
        this.validationErrorMessage = "Passwords do not match";
        return;
      }

      const hasLowerCase = /[a-z]/.test(password);
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);

      if (!hasLowerCase || !hasUpperCase || !hasNumber) {
        this.validationErrorMessage =
          "Password must include lowercase, uppercase, and numbers";
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
          <label for="email">Email address</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter email address"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="${this.mode === "signup"
              ? "Enter password (8 or more characters)"
              : "Enter password"}"
            required
          />
        </div>
        ${this.mode === "signup"
          ? html`
              <div class="form-group">
                <label for="passwordConfirm">Confirm password</label>
                <input
                  type="password"
                  name="passwordConfirm"
                  id="passwordConfirm"
                  placeholder="Re-enter password"
                  minlength="8"
                  required
                />
              </div>
            `
          : ""}
        <button type="submit" class="submit-button btn btn-primary">
          ${this.mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>
      <div class="divider">
        <span>or</span>
      </div>
    `;
  }

  render() {
    const displayedErrorMessage =
      this.validationErrorMessage || this.errorMessage;

    return html`
      <ui-popup>
        <span slot="header" class="popup-title">
          ${this.mode === "login" ? "Log in" : "Sign up"}
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
      </ui-popup>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    inputStyle,
    css`
      ui-popup {
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

      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .form-group label {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-fg-default);
      }

      .form-group input {
        width: 100%;
      }

      .submit-button {
        margin-top: 8px;
        width: 100%;
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
