import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import "../../../shared/ui/icons/icon-delete-forever";
import "../../../shared/ui/icons/icon-logout";
import "../../../shared/ui/popup/popup";
import {
  IdentityAccountDeleteEvent,
  IdentityLogoutEvent,
} from "../event/account";
import type { User } from "../model/user";
import "./change-password-form";

@customElement("identity-account-settings")
export class IdentityAccountSettings extends LitElement {
  @property({ type: Object })
  user?: User;

  @property({ type: Boolean })
  loading = false;

  @state()
  private _confirmOpen = false;

  private _handleLogoutClick() {
    this.dispatchEvent(new IdentityLogoutEvent());
  }

  private _handleDeleteClick() {
    this._confirmOpen = true;
  }

  private _handleConfirmDelete() {
    this.dispatchEvent(new IdentityAccountDeleteEvent());
  }

  private _handleCancelDelete() {
    this._confirmOpen = false;
  }

  private _handlePopupClose() {
    this._confirmOpen = false;
  }

  render() {
    if (!this.user) {
      return html`
        <p class="no-user">${msg("No user information available.")}</p>
      `;
    }

    return html`
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">${msg("Account")}</h2>
        </div>
        <div class="section-body">
          <dl class="info-list">
            <div class="info-item">
              <dt>${msg("Email")}</dt>
              <dd>${this.user.email}</dd>
            </div>
          </dl>
          <div class="section-actions">
            <button
              class="btn"
              @click=${this._handleLogoutClick}
              ?disabled=${this.loading}
            >
              <ui-icon-logout></ui-icon-logout>
              ${msg("Logout")}
            </button>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">${msg("Change Password")}</h2>
        </div>
        <div class="section-body">
          <identity-change-password-form></identity-change-password-form>
        </div>
      </div>

      <div class="section section-danger">
        <div class="section-header">
          <h2 class="section-title section-title-danger">
            ${msg("Danger Zone")}
          </h2>
        </div>
        <div class="section-body">
          <div class="danger-zone-content">
            <div class="danger-zone-description">
              <strong>${msg("Delete Account")}</strong>
              <p>
                ${msg(
                  "Once you delete your account, there is no going back. Please be certain.",
                )}
              </p>
            </div>
            <button
              class="btn btn-danger"
              @click=${this._handleDeleteClick}
              ?disabled=${this.loading}
            >
              <ui-icon-delete-forever></ui-icon-delete-forever>
              ${msg("Delete Account")}
            </button>
          </div>
        </div>
      </div>

      <ui-popup
        .open=${this._confirmOpen}
        @popup-closed=${this._handlePopupClose}
      >
        <div slot="header">${msg("Are you sure?")}</div>
        <div slot="main">
          <p class="confirm-message">
            ${msg(
              "This action cannot be undone. All your data will be permanently deleted.",
            )}
          </p>
        </div>
        <div slot="footer" class="confirm-actions">
          <button
            class="btn"
            @click=${this._handleCancelDelete}
            ?disabled=${this.loading}
          >
            ${msg("Cancel")}
          </button>
          <button
            class="btn btn-danger"
            @click=${this._handleConfirmDelete}
            ?disabled=${this.loading}
          >
            <ui-icon-delete-forever></ui-icon-delete-forever>
            ${msg("Delete Account")}
          </button>
        </div>
      </ui-popup>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      .no-user {
        color: var(--color-fg-muted);
        font-size: 14px;
      }

      .section {
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        margin-bottom: 24px;
        overflow: hidden;
      }

      .section-header {
        padding: 12px 16px;
        background-color: var(--color-canvas-subtle);
        border-bottom: 1px solid var(--color-border-default);
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        margin: 0;
        color: var(--color-fg-default);
      }

      .section-title-danger {
        color: var(--color-danger-fg);
      }

      .section-body {
        padding: 16px;
      }

      .section-danger {
        border-color: var(--color-danger-fg);
      }

      .section-danger .section-header {
        background-color: #fff0f0;
        border-bottom-color: var(--color-danger-fg);
      }

      .info-list {
        margin: 0 0 16px 0;
        padding: 0;
      }

      .info-item {
        display: flex;
        padding: 8px 0;
        border-bottom: 1px solid var(--color-border-muted);
      }

      .info-item:last-child {
        border-bottom: none;
      }

      .info-item dt {
        font-weight: 500;
        color: var(--color-fg-muted);
        font-size: 13px;
        width: 120px;
        flex-shrink: 0;
      }

      .info-item dd {
        margin: 0;
        color: var(--color-fg-default);
        font-size: 13px;
      }

      @media (max-width: 600px) {
        .info-item {
          flex-direction: column;
          gap: 2px;
        }

        .info-item dt {
          width: auto;
        }
      }

      .section-actions {
        display: flex;
        justify-content: flex-start;
      }

      @media (max-width: 600px) {
        .section-actions .btn {
          width: 100%;
          justify-content: center;
        }
      }

      .danger-zone-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      @media (max-width: 600px) {
        .danger-zone-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }

        .danger-zone-content .btn-danger {
          width: 100%;
          justify-content: center;
        }
      }

      .danger-zone-description p {
        font-size: 13px;
        color: var(--color-fg-muted);
        margin-top: 4px;
      }

      .btn-danger {
        color: var(--color-danger-fg);
        border-color: var(--color-danger-fg);
        background-color: var(--color-canvas-default);
        white-space: nowrap;
      }

      .btn-danger:hover {
        color: #ffffff;
        background-color: var(--color-danger-fg);
        border-color: var(--color-danger-fg);
      }

      .btn-danger:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .confirm-message {
        font-size: 14px;
        color: var(--color-fg-default);
        line-height: 1.5;
      }

      .confirm-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    `,
  ];
}
