import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import "./resend-verify-email-form";

export type VerifyEmailStatus = "loading" | "error";

@customElement("identity-verify-email")
export class IdentityVerifyEmail extends LitElement {
  @property()
  status: VerifyEmailStatus = "loading";

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
          <identity-resend-verify-email-form></identity-resend-verify-email-form>
        `;
    }
  }

  render() {
    return html`
      <div class="container">${this._renderContent()}</div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    `,
  ];
}
