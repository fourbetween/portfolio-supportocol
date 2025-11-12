import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";

@customElement("main-layout-container")
export class MainLayoutContainer extends LitElement {
  @property({ type: Boolean })
  isLoggedIn = false;

  render() {
    return html`
      <main>
        <slot></slot>
      </main>
    `;
  }

  static styles = [baseStyle, css``];
}
