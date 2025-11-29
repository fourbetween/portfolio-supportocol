import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("front-page-container")
export class FrontPageContainer extends LitElement {
  @property({ type: Boolean })
  isLoggedIn = false;

  render() {
    return html`
      <ul>
        <li>
          <a href="/dashboard">Go to Dashboard</a>
        </li>
      </ul>
    `;
  }
}
