import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { msg } from "@lit/localize";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { routerContext } from "../../../app/context/router";
import { navigate, paths } from "../../../app/paths";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { pageStyle } from "../../../shared/style/page";
import { IdentityConfirmPasswordResetEvent } from "../event/auth";
import { authService } from "../model/auth-service";
import "../ui/confirm-password-reset-form";

@customElement("identity-confirm-password-reset-page")
export class IdentityConfirmPasswordResetPage extends LitElement {
  @consume({ context: routerContext, subscribe: true })
  @state()
  private _router?: Router;

  @state()
  private _loading = false;

  private _token =
    new URLSearchParams(window.location.search).get("token") ?? "";

  private async _handleConfirmPasswordReset(
    e: IdentityConfirmPasswordResetEvent,
  ) {
    this._loading = true;
    try {
      await authService.confirmPasswordReset(e.token, e.newPassword);
      showToast(
        this,
        msg("Password reset successfully. Please log in."),
        "success",
      );
      if (this._router) {
        navigate(this._router, paths.identity.account);
      }
    } catch (error: any) {
      showToast(this, error.message, "error");
    } finally {
      this._loading = false;
    }
  }

  render() {
    if (!this._token) {
      return html`
        <main class="container">
          <header class="header">
            <p class="description">
              ${msg("Invalid or expired password reset link.")}
            </p>
          </header>
        </main>
      `;
    }

    return html`
      <main class="container">
        <header class="header">
          <h1>${msg("Set New Password")}</h1>
          <p class="description">${msg("Enter your new password below.")}</p>
        </header>
        <section class="content">
          <identity-confirm-password-reset-form
            .token=${this._token}
            ?disabled=${this._loading}
            @identity-confirm-password-reset=${this._handleConfirmPasswordReset}
          ></identity-confirm-password-reset-form>
        </section>
      </main>
    `;
  }

  static styles = [baseStyle, pageStyle];
}
