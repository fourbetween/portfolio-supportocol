import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { LitElement, html, type PropertyValues } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { routerContext } from "../../../app/context/router";
import { navigate, paths } from "../../../app/paths";
import { baseStyle } from "../../../shared/style/base";
import { client } from "../api/client";
import { GoogleAuthService } from "../api/google-auth";
import {
  IdentityAuthLoginEvent,
  IdentityAuthModeSwitchEvent,
  IdentityAuthSignupEvent,
  type AuthMode,
} from "../event/auth";
import "../ui/auth-popup";
import type { IdentityAuthPopup } from "../ui/auth-popup";

@customElement("identity-auth-widget")
export class IdentityAuthWidget extends LitElement {
  @consume({ context: routerContext, subscribe: true })
  @state()
  private _router?: Router;

  @state()
  private currentMode: AuthMode = "login";

  @state()
  private isLoading = false;

  @state()
  private errorMessage = "";

  private googleAuth?: GoogleAuthService;

  @query("identity-auth-popup")
  private popup!: IdentityAuthPopup;

  connectedCallback() {
    super.connectedCallback();
    this.initializeGoogleAuth();
    document.addEventListener(
      "identity-auth-popup-open",
      this.handleOpenAuthPopup,
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(
      "identity-auth-popup-open",
      this.handleOpenAuthPopup,
    );
  }

  protected async updated(changedProperties: PropertyValues) {
    if (changedProperties.has("currentMode")) {
      if (this.popup?.open) {
        await this.popup.updateComplete;
        this.renderGoogleButton();
      }
    }
  }

  async open() {
    this.errorMessage = "";
    if (this.popup) {
      this.popup.open = true;
      await this.popup.updateComplete;
      this.renderGoogleButton();
    }
  }

  close() {
    this.errorMessage = "";
    if (this.popup) {
      this.popup.open = false;
    }
  }

  private handleOpenAuthPopup = () => {
    this.open();
  };

  private initializeGoogleAuth() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not set");
      return;
    }

    this.googleAuth = new GoogleAuthService({
      clientId,
      onSuccess: () => {
        this.close();
        window.location.reload();
      },
      onError: (message) => {
        this.errorMessage = message;
      },
      onLoading: (isLoading) => {
        this.isLoading = isLoading;
      },
      onInitialized: () => {
        // Trigger re-render to show Google button
        this.requestUpdate();
      },
    });
    this.googleAuth.initialize();
  }

  private handleSwitchMode(mode: AuthMode) {
    this.currentMode = mode;
    this.errorMessage = "";
  }

  private async handleLogin(email: string, password: string) {
    this.isLoading = true;
    this.errorMessage = "";
    try {
      const { error } = await client.POST("/v1/identity/login", {
        body: { email, password },
      });
      if (error) {
        this.errorMessage = error.message;
        return;
      }
      this.close();
      window.location.reload();
    } catch (e) {
      this.errorMessage = String(e);
    } finally {
      this.isLoading = false;
    }
  }

  private async handleSignup(email: string, password: string) {
    this.isLoading = true;
    this.errorMessage = "";
    try {
      const { error } = await client.POST("/v1/identity/signup", {
        body: { email, password },
      });
      if (error) {
        this.errorMessage = error.message;
        return;
      }
      this.close();
      const checkEmailPath = `${paths.identity.checkEmail}?email=${encodeURIComponent(email)}`;
      if (this._router) {
        navigate(this._router, checkEmailPath);
      }
    } catch (e) {
      this.errorMessage = String(e);
    } finally {
      this.isLoading = false;
    }
  }

  private renderGoogleButton() {
    if (!this.googleAuth?.isInitialized()) {
      return;
    }

    const container = this.popup?.googleButtonContainer;
    if (container) {
      this.googleAuth.renderButton(container, this.currentMode);
    }
  }

  render() {
    return html`
      <identity-auth-popup
        .mode=${this.currentMode}
        .selfSignupEnabled=${true}
        .errorMessage=${this.errorMessage}
        .loading=${this.isLoading}
        @popup-closed=${() => this.close()}
        @identity-auth-mode-switch=${(e: IdentityAuthModeSwitchEvent) =>
          this.handleSwitchMode(e.mode)}
        @identity-auth-login=${(e: IdentityAuthLoginEvent) =>
          this.handleLogin(e.email, e.password)}
        @identity-auth-signup=${(e: IdentityAuthSignupEvent) =>
          this.handleSignup(e.email, e.password)}
      ></identity-auth-popup>
    `;
  }

  static styles = [baseStyle];
}
