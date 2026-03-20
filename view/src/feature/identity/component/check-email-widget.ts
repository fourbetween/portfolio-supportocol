import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { client } from "../api/client";
import { IdentityResendVerifyEmailEvent } from "../event/auth";
import "../ui/check-email";

@customElement("identity-check-email-widget")
export class IdentityCheckEmailWidget extends LitElement {
  @state()
  private _email = "";

  override connectedCallback() {
    super.connectedCallback();
    this._email = sessionStorage.getItem("signup_email") ?? "";
  }

  private async _handleResendVerifyEmail(e: IdentityResendVerifyEmailEvent) {
    const { error } = await client.POST("/v1/identity/resend-verify-email", {
      body: { email: e.email },
    });
    if (error) {
      showToast(this, error.message, "error");
    } else {
      showToast(this, "Verification email sent.", "success", 5000);
    }
  }

  render() {
    return html`
      <identity-check-email
        .initialEmail=${this._email}
        @identity-resend-verify-email=${this._handleResendVerifyEmail}
      ></identity-check-email>
    `;
  }
}
