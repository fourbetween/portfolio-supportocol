import { msg } from "@lit/localize";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { paths } from "../../../app/paths";
import { showToast } from "../../../shared/event/toast";
import { client } from "../api/client";
import { IdentityResendVerifyEmailEvent } from "../event/auth";
import "../ui/verify-email";
import type { VerifyEmailStatus } from "../ui/verify-email";

@customElement("identity-verify-email-widget")
export class IdentityVerifyEmailWidget extends LitElement {
  @state()
  private status: VerifyEmailStatus = "loading";

  override connectedCallback() {
    super.connectedCallback();
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      this.status = "error";
      return;
    }
    void this._verifyEmail(token);
  }

  private async _verifyEmail(token: string) {
    const { error } = await client.POST("/v1/identity/verify-email", {
      body: { token },
    });
    if (error) {
      this.status = "error";
      showToast(this, error.message, "error");
    } else {
      window.location.replace(paths.learning.dashboard);
    }
  }

  private async _handleResendVerifyEmail(e: IdentityResendVerifyEmailEvent) {
    const { error } = await client.POST("/v1/identity/resend-verify-email", {
      body: { email: e.email },
    });
    if (error) {
      showToast(this, error.message, "error");
    } else {
      showToast(this, msg("Verification email sent."), "success", 5000);
    }
  }

  render() {
    return html`
      <identity-verify-email
        .status=${this.status}
        @identity-resend-verify-email=${this._handleResendVerifyEmail}
      ></identity-verify-email>
    `;
  }
}
