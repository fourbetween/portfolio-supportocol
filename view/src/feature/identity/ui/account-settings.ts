import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { iconStyle } from "../../../shared/style/icon";
import "../../../shared/ui/popup/popup";
import { IdentityAccountDeleteEvent } from "../event/account";
import type { User } from "../model/user";

@customElement("identity-account-settings")
export class IdentityAccountSettings extends LitElement {
  @property({ type: Object })
  user?: User;

  @property({ type: Boolean })
  loading = false;

  @state()
  private _confirmOpen = false;

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
      <div class="account-info">
        <h2>${msg("Account Information")}</h2>
        <dl class="info-list">
          <div class="info-item">
            <dt>${msg("Name")}</dt>
            <dd>${this.user.name}</dd>
          </div>
          <div class="info-item">
            <dt>${msg("Email")}</dt>
            <dd>${this.user.email}</dd>
          </div>
        </dl>
      </div>

      <div class="danger-zone">
        <h2>${msg("Danger Zone")}</h2>
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
            <span class="material-symbols-outlined">delete_forever</span>
            ${msg("Delete Account")}
          </button>
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
            <span class="material-symbols-outlined">delete_forever</span>
            ${msg("Delete Account")}
          </button>
        </div>
      </ui-popup>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
    css`
      .no-user {
        color: var(--color-fg-muted);
        font-size: 14px;
      }

      .account-info {
        margin-bottom: 32px;
      }

      .info-list {
        margin: 0;
        padding: 0;
      }

      .info-item {
        display: flex;
        padding: 12px 0;
        border-bottom: 1px solid var(--color-border-muted);
      }

      .info-item dt {
        font-weight: 500;
        color: var(--color-fg-muted);
        width: 120px;
        flex-shrink: 0;
      }

      .info-item dd {
        margin: 0;
        color: var(--color-fg-default);
      }

      .danger-zone {
        border: 1px solid var(--color-danger-fg);
        border-radius: 6px;
        padding: 16px;
      }

      .danger-zone h2 {
        color: var(--color-danger-fg);
      }

      .danger-zone-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .danger-zone-description p {
        font-size: 14px;
        color: var(--color-fg-muted);
        margin-top: 4px;
      }

      .btn-danger {
        color: var(--color-danger-fg);
        border-color: var(--color-danger-fg);
        background-color: var(--color-canvas-default);
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
