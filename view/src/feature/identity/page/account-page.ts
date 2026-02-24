import { msg } from "@lit/localize";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { pageStyle } from "../../../shared/style/page";
import "../component/account-settings-widget";

@customElement("identity-account-page")
export class IdentityAccountPage extends LitElement {
  render() {
    return html`
      <main class="container">
        <header class="header">
          <h1>${msg("Account Information")}</h1>
          <p class="description">${msg("Manage your account settings.")}</p>
        </header>
        <section class="content">
          <identity-account-settings-widget></identity-account-settings-widget>
        </section>
      </main>
    `;
  }

  static styles = [baseStyle, pageStyle];
}
