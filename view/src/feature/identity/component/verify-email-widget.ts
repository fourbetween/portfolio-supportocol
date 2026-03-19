import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { client } from "../api/client";
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
      this.status = "success";
      showToast(this, "Email verified.", "success", 2000);
    }
  }

  render() {
    return html`
      <identity-verify-email .status=${this.status}></identity-verify-email>
    `;
  }
}
