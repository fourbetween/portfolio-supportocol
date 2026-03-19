import { msg } from "@lit/localize";
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";

export type VerifyEmailStatus = "loading" | "success" | "error";

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
      case "success":
        return html`
          <p>${msg("Your email has been verified.")}</p>
          <a href="/">${msg("Go to home")}</a>
        `;
      case "error":
        return html`
          <p>
            ${msg(
              "Email verification failed. The link may have expired or already been used.",
            )}
          </p>
        `;
    }
  }

  render() {
    return html`
      <div class="container">${this._renderContent()}</div>
    `;
  }

  static styles = [baseStyle];
}
