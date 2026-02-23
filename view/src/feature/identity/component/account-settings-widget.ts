import { consume } from "@lit/context";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { userContext } from "../../../app/context/user";
import { showToast } from "../../../shared/event/toast";
import type { IdentityAccountDeleteEvent } from "../event/account";
import { authService } from "../model/auth-service";
import type { User } from "../model/user";
import "../ui/account-settings";

@customElement("identity-account-settings-widget")
export class IdentityAccountSettingsWidget extends LitElement {
  @consume({ context: userContext, subscribe: true })
  @state()
  private user?: User;

  @state()
  private loading = false;

  private async _handleDeleteAccount(_e: IdentityAccountDeleteEvent) {
    this.loading = true;
    try {
      await authService.deleteAccount();
    } catch (error: any) {
      showToast(this, error.message, "error");
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <identity-account-settings
        .user=${this.user}
        .loading=${this.loading}
        @identity-account-delete=${this._handleDeleteAccount}
      ></identity-account-settings>
    `;
  }
}
