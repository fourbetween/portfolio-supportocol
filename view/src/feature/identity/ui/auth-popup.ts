import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { inputStyle } from "../../../shared/style/input";
import "../../../shared/ui/popup/popup";
import {
  AuthLoginEvent,
  AuthModeSwitchEvent,
  AuthSignupEvent,
  type AuthMode,
} from "../event/auth";

@customElement("identity-auth-popup")
export class IdentityAuthPopup extends LitElement {
  @property({ type: Boolean })
  open = false;

  @property({ type: String })
  mode: AuthMode = "login";

  @property({ type: Boolean })
  selfSignupEnabled = false;

  @property({ type: String })
  errorMessage = "";

  @property({ type: Boolean })
  loading = false;

  @state()
  private validationErrorMessage = "";

  get googleButtonContainer(): HTMLElement | null {
    return this.renderRoot.querySelector(".google-button-container");
  }

  private _handleSwitchClick(e: Event) {
    e.preventDefault();
    const newMode = this.mode === "login" ? "signup" : "login";
    this.dispatchEvent(new AuthModeSwitchEvent(newMode));
  }

  private _handlePopupClose() {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  }

  private renderSwitchPrompt() {
    if (this.mode === "login") {
      if (!this.selfSignupEnabled) return "";
      return html`
        Don't have an account?
        <a href="#" class="switch-link" @click=${this._handleSwitchClick}>
          Sign up
        </a>
      `;
    } else {
      return html`
        Already have an account?
        <a href="#" class="switch-link" @click=${this._handleSwitchClick}>
          Log in
        </a>
      `;
    }
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    this.validationErrorMessage = "";

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (this.mode === "login") {
      this.dispatchEvent(new AuthLoginEvent(email, password));
      return;
    }

    const passwordConfirm = formData.get("passwordConfirm") as string;
    const validationError = this.validateSignup(password, passwordConfirm);
    if (validationError) {
      this.validationErrorMessage = validationError;
      return;
    }

    this.dispatchEvent(new AuthSignupEvent(email, password));
  }

  private validateSignup(
    password: string,
    passwordConfirm: string
  ): string | null {
    if (password !== passwordConfirm) {
      return "Passwords do not match";
    }

    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasLowerCase || !hasUpperCase || !hasNumber) {
      return "Password must include lowercase, uppercase, and numbers";
    }

    return null;
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
        ${this.renderSignupFields()}
        <button type="submit" class="submit-button btn btn-primary">
          ${this.mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>
      <div class="divider">
        <span>or</span>
      </div>
    `;
  }

  private renderSignupFields() {
    if (this.mode !== "signup") return "";

    return html`
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
    `;
  }

  render() {
    return html`
      <ui-popup .open=${this.open} @close=${this._handlePopupClose}>
        <span slot="header" class="popup-title">
          ${this.mode === "login" ? "Log in" : "Sign up"}
        </span>
        <div slot="main" class="popup-content">
          ${this.renderErrorMessage()} ${this.renderForm()}
          <div class="google-button-container"></div>
          <p class="switch-prompt">${this.renderSwitchPrompt()}</p>
          ${this.renderLoadingOverlay()}
        </div>
      </ui-popup>
    `;
  }

  private renderErrorMessage() {
    const displayedErrorMessage =
      this.validationErrorMessage || this.errorMessage;
    if (!displayedErrorMessage) return "";

    return html`
      <div class="error-message">${displayedErrorMessage}</div>
    `;
  }

  private renderLoadingOverlay() {
    if (!this.loading) return "";

    return html`
      <div class="loading-overlay"></div>
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

      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.7);
        z-index: 1001;
        cursor: wait;
        border-radius: 12px;
      }
    `,
  ];
}
