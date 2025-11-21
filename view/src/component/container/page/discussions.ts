import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";

@customElement("discussions-page-container")
export class DiscussionsPageContainer extends LitElement {
  @property({ type: Boolean })
  isLoggedIn = false;

  render() {
    return html`
      discussions page
    `;
  }

  static styles = [baseStyle, css``];
}
