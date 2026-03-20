import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { inputStyle } from "../../../shared/style/input";
import { IdentityRequestPasswordResetEvent } from "../event/auth";

@customElement("identity-request-password-reset-form")
export class IdentityRequestPasswordResetForm extends LitElement {
  @property({ type: Boolean })
  disabled = false;

  @state()
  private _email = "";

  private _handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    this.dispatchEvent(
      new IdentityRequestPasswordResetEvent(this._email.trim()),
    );
  }

  render() {
    return html`
      <form class="form" @submit=${this._handleSubmit}>
        <input
          class="email-input"
          type="email"
          .value=${this._email}
          @input=${(e: InputEvent) => {
            this._email = (e.target as HTMLInputElement).value;
          }}
          placeholder=${msg("Enter your email")}
          required
        />
        <button
          type="submit"
          class="btn btn-primary submit-button"
          ?disabled=${this.disabled || this._email.trim().length === 0}
        >
          ${msg("Send reset email")}
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

      .email-input,
      .submit-button {
        width: 100%;
        min-height: 40px;
      }
    `,
  ];
}
