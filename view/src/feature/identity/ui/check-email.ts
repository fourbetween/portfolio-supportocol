import { LitElement, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { inputStyle } from "../../../shared/style/input";
import { IdentityResendVerifyEmailEvent } from "../event/auth";

@customElement("identity-check-email")
export class IdentityCheckEmail extends LitElement {
  @property()
  initialEmail: string = "";

  @state()
  private _email = "";

  override willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("initialEmail")) {
      this._email = this.initialEmail;
    }
  }

  private _handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    this.dispatchEvent(new IdentityResendVerifyEmailEvent(this._email));
  }

  render() {
    return html`
      <div>
        <p>Please check your email to verify your account.</p>
        <p>If you did not receive the email, you can request a new one.</p>
        <form @submit=${this._handleSubmit}>
          <input
            type="email"
            .value=${this._email}
            @input=${(e: InputEvent) => {
              this._email = (e.target as HTMLInputElement).value;
            }}
            placeholder="Enter your email"
          />
          <button type="submit" class="btn btn-primary">
            Resend verification email
          </button>
        </form>
      </div>
    `;
  }

  static styles = [baseStyle, inputStyle, buttonStyle];
}
