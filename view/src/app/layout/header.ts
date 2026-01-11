import { consume } from "@lit/context";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { authService } from "../../feature/identity/model/auth";
import type { User } from "../../feature/identity/model/user";
import { baseStyle } from "../../shared/style/base";
import { iconStyle } from "../../shared/style/icon";
import { userContext } from "../context/user";
import { paths } from "../paths";

@customElement("app-header")
export class AppHeader extends LitElement {
  @consume({ context: userContext, subscribe: true })
  @state()
  private user: User | null = null;

  private handleLogout() {
    authService.logout();
  }

  render() {
    return html`
      <header class="header">
        <a href=${paths.learning.dashboard} class="header-logo">Supportocol</a>
        ${this.user
          ? html`
              <div class="header-actions">
                <button class="logout-button" @click=${this.handleLogout}>
                  <span class="material-symbols-outlined">logout</span>
                  Logout
                </button>
              </div>
            `
          : ""}
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

      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }

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

      .logout-button:hover {
        opacity: 0.8;
        background-color: rgba(255, 255, 255, 0.1);
      }
    `,
  ];
}
