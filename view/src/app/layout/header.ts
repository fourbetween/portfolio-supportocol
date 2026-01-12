import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../shared/style/base";
import { iconStyle } from "../../shared/style/icon";
import { paths } from "../paths";

@customElement("app-header")
export class AppHeader extends LitElement {
  render() {
    return html`
      <header class="header">
        <a href=${paths.marketing.home} class="header-logo">Supportocol</a>
        <nav class="header-nav">
          <a href=${paths.learning.dashboard} class="nav-item">Learning</a>
          <a href=${paths.dialogue.search} class="nav-item">Dialogue</a>
        </nav>
      </header>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    css`
      .header {
        background-color: var(--color-header-bg);
        padding: 8px 16px;
        color: var(--color-header-text);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }

      .header-logo {
        font-size: 20px;
        font-weight: bold;
        color: inherit;
        text-decoration: none;
      }

      .header-nav {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .nav-item {
        color: inherit;
        text-decoration: none;
        font-size: 14px;
        padding: 4px 12px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .nav-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    `,
  ];
}
