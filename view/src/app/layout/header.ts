import { consume } from "@lit/context";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { authService } from "../../feature/identity/model/auth-service";
import type { User } from "../../feature/identity/model/user";
import "../../feature/workspace/component/workspace-select-widget";
import { baseStyle } from "../../shared/style/base";
import { iconStyle } from "../../shared/style/icon";
import { userContext } from "../context/user";
import { TouchController } from "../controller/touch";
import { paths } from "../paths";

@customElement("app-header")
export class AppHeader extends LitElement {
  @consume({ context: userContext, subscribe: true })
  @state()
  private user?: User;

  private touch = new TouchController(this);

  private handleLogin() {
    authService.login();
  }

  private handleLogout() {
    authService.logout();
  }

  render() {
    return html`
      <header class="header ${this.touch.isTouchDevice ? "touch" : ""}">
        <a href=${paths.marketing.home} class="header-logo">Supportocol</a>
        <nav class="header-nav">
          <a href=${paths.learning.dashboard} class="nav-item">
            ${this.touch.isTouchDevice
              ? html`
                  <span class="material-symbols-outlined">school</span>
                `
              : ""}
            <span>Learning</span>
          </a>
          <a href=${paths.dialogue.search} class="nav-item">
            ${this.touch.isTouchDevice
              ? html`
                  <span class="material-symbols-outlined">forum</span>
                `
              : ""}
            <span>Dialogue</span>
          </a>
          <a href=${paths.workspace.projects} class="nav-item">
            ${this.touch.isTouchDevice
              ? html`
                  <span class="material-symbols-outlined">folder</span>
                `
              : ""}
            <span>Projects</span>
          </a>
        </nav>
        <div class="header-actions">
          ${this.user
            ? html`
                <button
                  class="logout-button"
                  @click=${this.handleLogout}
                  aria-label="Logout"
                >
                  <span class="material-symbols-outlined">logout</span>
                  ${this.touch.isTouchDevice ? "" : "Logout"}
                </button>
              `
            : html`
                <button
                  class="login-button"
                  @click=${this.handleLogin}
                  aria-label="Login"
                >
                  <span class="material-symbols-outlined">login</span>
                  ${this.touch.isTouchDevice ? "" : "Login"}
                </button>
              `}
        </div>
      </header>
      <workspace-workspace-select-widget></workspace-workspace-select-widget>
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
        width: 100vw;
      }

      .header-logo {
        font-size: 20px;
        font-weight: bold;
        color: inherit;
        text-decoration: none;
      }

      .header.touch .header-logo {
        font-size: 16px;
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
        background-color: rgba(255, 255, 255, 0.1);
      }

      .header.touch .nav-item {
        flex-direction: column;
        padding: 4px 8px;
        font-size: 8px;
        gap: 2px;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .login-button,
      .logout-button {
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

      .login-button:hover,
      .logout-button:hover {
        opacity: 0.8;
        background-color: rgba(255, 255, 255, 0.1);
      }
    `,
  ];
}
