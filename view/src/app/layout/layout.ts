import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../shared/style/base";
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
    baseStyle,
    css`
      :host {
        background-color: var(--color-canvas-default);
      }
      .layout {
        display: flex;
        flex-direction: column;
        height: 100vh; /* fallback */
        height: 100svh;
      }
      main {
        flex: 1;
        overflow-y: auto;
        background-color: var(--color-canvas-default);
      }
    `,
  ];
}
