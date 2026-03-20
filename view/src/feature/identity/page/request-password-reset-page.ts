import { msg } from "@lit/localize";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { pageStyle } from "../../../shared/style/page";
import { IdentityRequestPasswordResetEvent } from "../event/auth";
import { authService } from "../model/auth-service";
import "../ui/request-password-reset-form";

@customElement("identity-request-password-reset-page")
export class IdentityRequestPasswordResetPage extends LitElement {
  @state()
  private _loading = false;

  @state()
  private _submitted = false;

  private async _handleRequestPasswordReset(
    e: IdentityRequestPasswordResetEvent,
  ) {
    this._loading = true;
    try {
      await authService.requestPasswordReset(e.email);
      this._submitted = true;
    } catch (error: any) {
      showToast(this, error.message, "error");
    } finally {
      this._loading = false;
    }
  }

  render() {
    if (this._submitted) {
      return html`
        <main class="container">
          <header class="header">
            <h1>${msg("Check your email")}</h1>
            <p class="description">
              ${msg(
                "If an account with that email exists, we've sent a password reset link.",
              )}
            </p>
          </header>
        </main>
      `;
    }

    return html`
      <main class="container">
        <header class="header">
          <h1>${msg("Reset Password")}</h1>
          <p class="description">
            ${msg("Enter your email to receive a password reset link.")}
          </p>
        </header>
        <section class="content">
          <identity-request-password-reset-form
            ?disabled=${this._loading}
            @identity-request-password-reset=${this._handleRequestPasswordReset}
          ></identity-request-password-reset-form>
        </section>
      </main>
    `;
  }

  static styles = [baseStyle, pageStyle];
}
