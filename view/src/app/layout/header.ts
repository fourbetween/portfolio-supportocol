import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../shared/style/base";
import { routes } from "../routes";

@customElement("app-header")
export class AppHeader extends LitElement {
  render() {
    return html`
      <header class="header">
        <a href=${routes.dashboard} class="header-logo">Supportocol</a>
      </header>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .header {
        background-color: var(--color-header-bg);
        padding: 4px 16px;
        color: var(--color-header-text);
        display: flex;
        align-items: center;
        gap: 24px;
      }

      .header-logo {
        font-size: 14px;
        font-weight: bold;
        color: inherit;
        text-decoration: none;
      }
    `,
  ];
}
