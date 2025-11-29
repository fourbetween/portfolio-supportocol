import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";

@customElement("main-layout-container")
export class MainLayoutContainer extends LitElement {
  @property({ type: Boolean })
  isLoggedIn = false;

  render() {
    return html`
      <div class="layout">
        <main-header-presenter></main-header-presenter>
        <main>
          <slot></slot>
        </main>
      </div>
    `;
  }

  static styles = [baseStyle, css``];
}
