import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";

@customElement("home-page-presenter")
export class HomePagePresenter extends LitElement {
  @property({ attribute: false })
  onLogin?: () => void;

  render() {
    return html`
      <main class="container">
        <h1>Supportocol</h1>
        <p class="description">論理的な議論を支援するプラットフォーム</p>
        <div class="actions">
          <button class="btn-primary" @click=${this.handleLogin}>
            ログイン
          </button>
          <a href="/discussions" class="link">公開議論を見る</a>
        </div>
      </main>
    `;
  }

  private handleLogin() {
    this.onLogin?.();
  }

  static styles = [
    baseStyle,
    css`
      :host {
        display: block;
        min-height: 100vh;
        background-color: var(--color-canvas-default);
      }

      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 80px 24px;
        text-align: center;
      }

      h1 {
        font-size: 48px;
        font-weight: 700;
        color: var(--color-fg-default);
        margin: 0 0 16px 0;
      }

      .description {
        font-size: 20px;
        color: var(--color-fg-muted);
        margin: 0 0 40px 0;
        line-height: 1.5;
      }

      .actions {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }

      .btn-primary {
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 600;
        color: var(--color-btn-primary-text);
        background-color: var(--color-btn-primary-bg);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .btn-primary:hover {
        background-color: var(--color-btn-primary-hover-bg);
      }

      .link {
        font-size: 16px;
        color: var(--color-accent-fg);
        text-decoration: none;
      }

      .link:hover {
        text-decoration: underline;
      }
    `,
  ];
}
