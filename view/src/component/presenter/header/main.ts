import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";

@customElement("main-header-presenter")
export class MainHeaderPresenter extends LitElement {
  render() {
    return html`
      <header class="header">
        <a href="/" class="header-logo">Supportocol</a>
        <nav class="header-nav">
          <a href="/dashboard">ダッシュボード</a>
          <a href="/projects">プロジェクト</a>
          <a href="/discussions">議論</a>
          <a href="/rules">ルール</a>
        </nav>
      </header>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .header {
        background-color: var(--color-header-bg);
        padding: 16px;
        color: var(--color-header-text);
        display: flex;
        align-items: center;
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
        gap: 16px;
      }

      .header-nav a {
        color: inherit;
        text-decoration: none;
        font-size: 14px;
        font-weight: bold;
      }

      .header-nav a:hover {
        opacity: 0.7;
      }

      .header-nav a.active {
        opacity: 1;
      }
    `,
  ];
}
