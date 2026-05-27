import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { paths } from "../../../app/paths";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { inputStyle } from "../../../shared/style/input";
import "../../../shared/ui/popup/popup";
import {
  IdentityAuthLoginEvent,
  IdentityAuthModeSwitchEvent,
  IdentityAuthSignupEvent,
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
    this.dispatchEvent(new IdentityAuthModeSwitchEvent(newMode));
  }

  private _handlePopupClose() {
    this.open = false;
  }

  private renderSwitchPrompt() {
    if (this.mode === "login") {
      if (!this.selfSignupEnabled) return "";
      return html`
        ${msg("Don't have an account?")}
        <a href="#" class="switch-link" @click=${this._handleSwitchClick}>
          ${msg("Sign up")}
        </a>
      `;
    } else {
      return html`
        ${msg("Already have an account?")}
        <a href="#" class="switch-link" @click=${this._handleSwitchClick}>
          ${msg("Log in")}
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
      this.dispatchEvent(new IdentityAuthLoginEvent(email, password));
      return;
    }

    const passwordConfirm = formData.get("passwordConfirm") as string;
    const validationError = this.validateSignup(password, passwordConfirm);
    if (validationError) {
      this.validationErrorMessage = validationError;
      return;
    }

    this.dispatchEvent(new IdentityAuthSignupEvent(email, password));
  }

  private validateSignup(
    password: string,
    passwordConfirm: string,
  ): string | null {
    if (password !== passwordConfirm) {
      return msg("Passwords do not match");
    }

    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLowerCase || !hasNumber) {
      return msg("Password must include lowercase letters and numbers");
    }

    return null;
  }

  private renderForm() {
    if (!this.selfSignupEnabled) return "";

    return html`
      <form class="auth-form" @submit=${this.handleSubmit}>
        <div class="form-group">
          <label for="email">${msg("Email address")}</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder=${msg("Enter email address")}
            required
          />
        </div>
        <div class="form-group">
          <label for="password">${msg("Password")}</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder=${this.mode === "signup"
              ? msg("Enter password (8 or more characters)")
              : msg("Enter password")}
            required
          />
        </div>
        ${this.mode === "login"
          ? html`
              <div class="forgot-password">
                <a
                  href=${paths.identity.requestPasswordReset}
                  class="forgot-link"
                >
                  ${msg("Forgot password?")}
                </a>
              </div>
            `
          : ""}
        ${this.renderSignupFields()}
        <button type="submit" class="submit-button btn btn-primary">
          ${this.mode === "login" ? msg("Log in") : msg("Sign up")}
        </button>
      </form>
      <div class="divider">
        <span>${msg("or")}</span>
      </div>
    `;
  }

  private renderSignupFields() {
    if (this.mode !== "signup") return "";

    return html`
      <div class="form-group">
        <label for="passwordConfirm">${msg("Confirm password")}</label>
        <input
          type="password"
          name="passwordConfirm"
          id="passwordConfirm"
          placeholder=${msg("Re-enter password")}
          minlength="8"
          required
        />
      </div>
    `;
  }

  render() {
    return html`
      <ui-popup .open=${this.open} @popup-closed=${this._handlePopupClose}>
        <span slot="header" class="popup-title">
          ${this.mode === "login" ? msg("Log in") : msg("Sign up")}
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
        color: var(--color-fg-default);
      }

      .error-message {
        background-color: var(--color-danger-bg);
        border: 1px solid var(--color-danger-border);
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 16px;
        color: var(--color-danger-fg);
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

      .forgot-password {
        text-align: right;
        font-size: 12px;
      }

      .forgot-link {
        color: var(--color-accent-fg);
        text-decoration: none;
      }

      .forgot-link:hover {
        text-decoration: underline;
      }

      .divider {
        display: flex;
        align-items: center;
        margin: 24px 0;
        color: var(--color-fg-muted);
        font-size: 12px;
      }

      .divider::before,
      .divider::after {
        content: "";
        flex: 1;
        height: 1px;
        background-color: var(--color-border-default);
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
        color: var(--color-fg-muted);
      }
      .switch-prompt:empty {
        display: none;
      }

      .switch-link {
        color: var(--color-accent-fg);
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
        background-color: var(--color-loading-overlay);
        z-index: 1001;
        cursor: wait;
        border-radius: 12px;
      }
    `,
  ];
}
