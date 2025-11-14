import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";

@customElement("header-presenter")
export class HeaderPresenter extends LitElement {
  render() {
    return html`
      <header class="header">
        <div class="header-container">
          <a href="/" class="site-title">Supportocol</a>
          <nav class="navigation">
            <a href="/dashboard" class="nav-link">ダッシュボード</a>
            <a href="/rules" class="nav-link">ルール</a>
            <a href="/projects" class="nav-link">プロジェクト</a>
          </nav>
        </div>
      </header>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .header {
        background-color: #ffffff;
        border-bottom: 1px solid #d0d7de;
        padding: 16px;
      }

      .header-container {
        max-width: 1280px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .site-title {
        font-size: 20px;
        font-weight: 600;
        color: #24292f;
        text-decoration: none;
        margin-right: 16px;
      }

      .site-title:hover {
        color: #0969da;
      }

      .navigation {
        display: flex;
        gap: 16px;
        align-items: center;
      }

      .nav-link {
        font-size: 14px;
        font-weight: 600;
        color: #24292f;
        text-decoration: none;
        padding: 8px 16px;
        border-radius: 6px;
        transition: background-color 0.2s ease;
      }

      .nav-link:hover {
        background-color: #f6f8fa;
      }

      .nav-link:focus {
        outline: 2px solid #0969da;
        outline-offset: 2px;
      }
    `,
  ];
}
