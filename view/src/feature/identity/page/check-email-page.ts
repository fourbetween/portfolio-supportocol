import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { pageStyle } from "../../../shared/style/page";
import "../component/check-email-widget";

@customElement("identity-check-email-page")
export class IdentityCheckEmailPage extends LitElement {
  render() {
    return html`
      <main class="container">
        <header class="header">
          <h1>Check Your Email</h1>
        </header>
        <section class="content">
          <identity-check-email-widget></identity-check-email-widget>
        </section>
      </main>
    `;
  }

  static styles = [baseStyle, pageStyle];
}
