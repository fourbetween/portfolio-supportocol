import { msg } from "@lit/localize";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { pageStyle } from "../../../shared/style/page";
import "../component/verify-email-widget";

@customElement("identity-verify-email-page")
export class IdentityVerifyEmailPage extends LitElement {
  render() {
    return html`
      <main class="container">
        <header class="header">
          <h1>${msg("Email Verification")}</h1>
        </header>
        <section class="content">
          <identity-verify-email-widget></identity-verify-email-widget>
        </section>
      </main>
    `;
  }

  static styles = [baseStyle, pageStyle];
}
