import { msg } from "@lit/localize";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { inputStyle } from "../../../shared/style/input";
import { IdentityResendVerifyEmailEvent } from "../event/auth";

export type VerifyEmailStatus = "loading" | "error";

@customElement("identity-verify-email")
export class IdentityVerifyEmail extends LitElement {
  @property()
  status: VerifyEmailStatus = "loading";

  @state()
  private _email = "";

  private _renderContent() {
    switch (this.status) {
      case "loading":
        return html`
          <p>${msg("Verifying your email...")}</p>
        `;
      case "error":
        return html`
          <p>
            ${msg(
              "Email verification failed. The link may have expired or already been used.",
            )}
          </p>
          <div>
            <input
              type="email"
              .value=${this._email}
              @input=${(e: InputEvent) => {
                this._email = (e.target as HTMLInputElement).value;
              }}
              placeholder=${msg("Enter your email")}
            />
            <button
              class="btn btn-primary"
              @click=${() =>
                this.dispatchEvent(
                  new IdentityResendVerifyEmailEvent(this._email),
                )}
            >
              ${msg("Resend verification email")}
            </button>
          </div>
        `;
    }
  }

  render() {
    return html`
      <div class="container">${this._renderContent()}</div>
    `;
  }

  static styles = [baseStyle, inputStyle, buttonStyle];
}
