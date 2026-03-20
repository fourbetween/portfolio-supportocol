import { msg } from "@lit/localize";
import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { inputStyle } from "../../../shared/style/input";
import { IdentityResendVerifyEmailEvent } from "../event/auth";

@customElement("identity-resend-verify-email-form")
export class IdentityResendVerifyEmailForm extends LitElement {
  @property()
  initialEmail = "";

  @property()
  placeholder = msg("Enter your email");

  @property()
  submitLabel = msg("Resend verification email");

  @state()
  private _email = "";

  override willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("initialEmail")) {
      this._email = this.initialEmail;
    }
  }

  private _handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    this.dispatchEvent(new IdentityResendVerifyEmailEvent(this._email.trim()));
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
          placeholder=${this.placeholder}
          required
        />
        <button
          type="submit"
          class="btn btn-primary submit-button"
          ?disabled=${this._email.trim().length === 0}
        >
          ${this.submitLabel}
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

      @media (min-width: 640px) {
        .form {
          flex-direction: row;
          align-items: center;
        }

        .email-input {
          flex: 1;
          min-width: 0;
        }

        .submit-button {
          width: auto;
          flex-shrink: 0;
        }
      }
    `,
  ];
}
