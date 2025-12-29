import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";

@customElement("marketing-home-page")
export class MarketingHomePage extends LitElement {
  @property({ attribute: false })
  onLogin?: () => void;

  render() {
    return html`
      <main class="container container--narrow hero">
        <h1>Supportocol</h1>
        <p class="description">論理的な議論を支援するプラットフォーム</p>
        <div class="actions">
          <button class="btn-primary btn-large" @click=${this.handleLogin}>
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
    buttonStyle,
    css`
      .hero {
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

      .btn-large {
        padding: 12px 24px;
        font-size: 16px;
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
