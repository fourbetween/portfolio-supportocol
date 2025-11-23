import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../style/base";

@customElement("create-rules-page-container")
export class CreateRulesPageContainer extends LitElement {
  @property({ type: Boolean })
  isLoggedIn = false;

  render() {
    return html`
      <div class="container">
        <create-rule-form-presenter></create-rule-form-presenter>
      </div>
    `;
  }

  static styles = [baseStyle, css``];
}
