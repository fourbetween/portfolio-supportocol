import { LitElement, html, type PropertyValues } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
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

  private handleLogin(email: string, _password: string) {
    console.log("Login attempt:", email);
    // TODO: Implement email/password login
  }

  private handleSignup(email: string, _password: string) {
    console.log("Signup attempt:", email);
    // TODO: Implement email/password signup
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
