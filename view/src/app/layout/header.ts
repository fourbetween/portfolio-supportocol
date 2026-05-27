import { consume } from "@lit/context";
import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { authService } from "../../feature/identity/model/auth-service";
import type { User } from "../../feature/identity/model/user";
import "../../feature/workspace/component/workspace-select-widget";
import { baseStyle } from "../../shared/style/base";
import "../../shared/ui/icons/icon-folder";
import "../../shared/ui/icons/icon-forum";
import "../../shared/ui/icons/icon-help";
import "../../shared/ui/icons/icon-login";
import "../../shared/ui/icons/icon-school";
import "../../shared/ui/icons/icon-settings";
import { userContext } from "../context/user";
import { paths } from "../paths";

@customElement("app-header")
export class AppHeader extends LitElement {
  @consume({ context: userContext, subscribe: true })
  @state()
  private user?: User;

  private handleLogin() {
    authService.login();
  }

  render() {
    return html`
      <header class="header">
        <a href=${paths.marketing.home} class="header-logo">Supportocol</a>
        <nav class="header-nav">
          <a href=${paths.learning.dashboard} class="nav-item">
            <ui-icon-school class="nav-icon"></ui-icon-school>
            <span>${msg("Learning")}</span>
          </a>
          <a href=${paths.dialogue.search} class="nav-item">
            <ui-icon-forum class="nav-icon"></ui-icon-forum>
            <span>${msg("Dialogue")}</span>
          </a>
          <a href=${paths.workspace.projects} class="nav-item">
            <ui-icon-folder class="nav-icon"></ui-icon-folder>
            <span>${msg("Projects")}</span>
          </a>
        </nav>
        <div class="header-actions">
          <a
            href=${paths.marketing.howToUse}
            class="nav-item account-link"
            aria-label=${msg("How to Use")}
          >
            <ui-icon-help .size=${20}></ui-icon-help>
          </a>
          ${this.user
            ? html`
                <a
                  href=${paths.identity.account}
                  class="nav-item account-link"
                  aria-label=${msg("Account Information")}
                >
                  <ui-icon-settings .size=${20}></ui-icon-settings>
                </a>
              `
            : html`
                <button
                  class="login-button"
                  @click=${this.handleLogin}
                  aria-label=${msg("Login")}
                >
                  <ui-icon-login></ui-icon-login>
                  <span class="button-text">${msg("Login")}</span>
                </button>
              `}
        </div>
      </header>
      <workspace-workspace-select-widget></workspace-workspace-select-widget>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .header {
        background-color: var(--color-header-bg);
        padding: 8px 16px;
        color: var(--color-header-text);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        width: 100%;
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
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .nav-item:hover {
        background-color: var(--color-hover-overlay);
      }

      .nav-item .nav-icon {
        display: none;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .login-button {
        display: flex;
        align-items: center;
        gap: 4px;
        background: none;
        border: 1px solid var(--color-header-text);
        color: inherit;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: opacity 0.2s;
      }

      .login-button:hover {
        opacity: 0.8;
        background-color: var(--color-hover-overlay);
      }

      .account-link {
        color: inherit;
        text-decoration: none;
        border: none;
        padding: 4px 8px;
      }

      .account-link:hover {
        background-color: var(--color-hover-overlay);
      }

      @media (max-width: 600px) {
        .header {
          gap: 12px;
          padding: 8px;
        }

        .header-logo {
          font-size: 16px;
        }

        .nav-item {
          flex-direction: column;
          padding: 4px 8px;
          font-size: 8px;
          gap: 2px;
        }

        .nav-item .nav-icon {
          display: block;
        }

        .header-actions {
          gap: 8px;
        }

        .header-actions .button-text {
          display: none;
        }
      }
    `,
  ];
}
