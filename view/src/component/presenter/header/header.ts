import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";

@customElement("header-presenter")
export class HeaderPresenter extends LitElement {
  @property({ type: String })
  currentPath: string = "";

  render() {
    return html`
      <header class="header">
        <a href="/" class="header-logo">Supportocol</a>
        <nav class="header-nav">
          <a
            href="/view/sample/page/dashboard.html"
            class="${this.currentPath === "/view/sample/page/dashboard.html"
              ? "active"
              : ""}"
          >
            ダッシュボード
          </a>
          <a
            href="/view/sample/page/project/list.html"
            class="${this.currentPath === "/view/sample/page/project/list.html"
              ? "active"
              : ""}"
          >
            プロジェクト
          </a>
          <a
            href="/view/sample/page/discussion/list.html"
            class="${this.currentPath ===
            "/view/sample/page/discussion/list.html"
              ? "active"
              : ""}"
          >
            議論
          </a>
          <a
            href="/view/sample/page/rule/list.html"
            class="${this.currentPath === "/view/sample/page/rule/list.html"
              ? "active"
              : ""}"
          >
            ルール
          </a>
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
