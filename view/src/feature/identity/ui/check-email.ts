import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import "./resend-verify-email-form";

@customElement("identity-check-email")
export class IdentityCheckEmail extends LitElement {
  @property()
  initialEmail: string = "";

  render() {
    return html`
      <div class="container">
        <p>${msg("Please check your email to verify your account.")}</p>
        <p>
          ${msg("If you did not receive the email, you can request a new one.")}
        </p>
        <identity-resend-verify-email-form
          .initialEmail=${this.initialEmail}
        ></identity-resend-verify-email-form>
      </div>
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
