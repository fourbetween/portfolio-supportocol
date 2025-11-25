import { css, html, LitElement, type CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";

@customElement("home-page-presenter")
export class HomePagePresenter extends LitElement {
  @property({ attribute: false })
  onLoginCallback?: () => void;

  render() {
    return html`
      <div class="home-page">
        <h1 class="app-title">Supportocol</h1>
        <p class="app-description">
          論理的な議論を促進するためのプラットフォーム
        </p>
        <button class="login-button" @click=${this.onLoginCallback}>
          ログイン
        </button>
        <a href="/discussions" class="discussions-link">公開議論一覧</a>
      </div>
    `;
  }

  static styles: CSSResultGroup = [
    baseStyle,
    css`
      .home-page {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .app-title {
        font-size: 2.5rem;
        color: var(--color-fg-default);
        margin-bottom: 8px;
      }

      .app-description {
        font-size: 1.25rem;
        color: var(--color-fg-muted);
        margin-bottom: 24px;
      }

      .login-button {
        padding: 12px 24px;
        font-size: 1rem;
        font-weight: 600;
        background-color: var(--color-btn-primary-bg);
        color: var(--color-btn-primary-text);
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }

      .login-button:hover {
        background-color: var(--color-btn-primary-hover-bg);
      }

      .discussions-link {
        color: var(--color-accent-fg);
        text-decoration: none;
      }

      .discussions-link:hover {
        text-decoration: underline;
      }
    `,
  ];
}
