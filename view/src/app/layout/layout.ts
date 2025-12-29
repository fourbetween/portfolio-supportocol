import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import "./header";

@customElement("app-layout")
export class AppLayout extends LitElement {
  render() {
    return html`
      <div class="layout">
        <app-header></app-header>
        <main>
          <slot></slot>
        </main>
      </div>
    `;
  }

  static styles = [];
}
