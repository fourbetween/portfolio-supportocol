import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { inputStyle } from "../../../shared/style/input";
import { IdentityConfirmPasswordResetEvent } from "../event/auth";

@customElement("identity-confirm-password-reset-form")
export class IdentityConfirmPasswordResetForm extends LitElement {
  @property()
  token = "";

  @property({ type: Boolean })
  disabled = false;

  @state()
  private _newPassword = "";

  @state()
  private _confirmPassword = "";

  @state()
  private _validationError = "";

  private _handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    this._validationError = "";

    if (this._newPassword !== this._confirmPassword) {
      this._validationError = msg("Passwords do not match");
      return;
    }

    this.dispatchEvent(
      new IdentityConfirmPasswordResetEvent(this.token, this._newPassword),
    );
  }

  render() {
    return html`
      <form class="form" @submit=${this._handleSubmit}>
        ${this._validationError
          ? html`
              <p class="error-message">${this._validationError}</p>
            `
          : ""}
        <div class="form-group">
          <label for="newPassword">${msg("New password")}</label>
          <input
            id="newPassword"
            class="password-input"
            type="password"
            .value=${this._newPassword}
            @input=${(e: InputEvent) => {
              this._newPassword = (e.target as HTMLInputElement).value;
            }}
            placeholder=${msg("Enter new password")}
            minlength="8"
            required
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">${msg("Confirm new password")}</label>
          <input
            id="confirmPassword"
            class="password-input"
            type="password"
            .value=${this._confirmPassword}
            @input=${(e: InputEvent) => {
              this._confirmPassword = (e.target as HTMLInputElement).value;
            }}
            placeholder=${msg("Re-enter new password")}
            minlength="8"
            required
          />
        </div>
        <button
          type="submit"
          class="btn btn-primary submit-button"
          ?disabled=${this.disabled ||
          this._newPassword.length === 0 ||
          this._confirmPassword.length === 0}
        >
          ${msg("Reset password")}
        </button>
      </form>
    `;
  }

  static styles = [
    baseStyle,
    inputStyle,
    buttonStyle,
    css`
      .form {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        width: 100%;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .form-group label {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-fg-muted);
      }

      .password-input,
      .submit-button {
        width: 100%;
        min-height: 40px;
      }

      .error-message {
        color: var(--color-danger-fg);
        font-size: 14px;
        margin: 0;
      }
    `,
  ];
}
