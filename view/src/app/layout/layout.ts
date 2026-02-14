import { LitElement, css, html } from "lit";
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

  static styles = [
    css`
      :host {
        display: block;
      }
      .layout {
        display: flex;
        flex-direction: column;
        height: 100vh;
      }
      main {
        flex: 1;
        overflow-y: auto;
      }
    `,
  ];
}
