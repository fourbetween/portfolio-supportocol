import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";

@customElement("dialogue-search-page")
export class DialogueSearchPage extends LitElement {
  render() {
    return html`
      <div>search page</div>
    `;
  }

  static styles = [baseStyle, buttonStyle, css``];
}
