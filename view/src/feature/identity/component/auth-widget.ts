import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { GoogleAuthService } from "../api/google-auth";
import {
  AuthLoginEvent,
  AuthModeSwitchEvent,
  AuthSignupEvent,
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
    document.addEventListener("auth-popup-open", this.handleOpenAuthPopup);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("auth-popup-open", this.handleOpenAuthPopup);
  }

  open() {
    this.errorMessage = "";
    this.popup.open();
  }

  close() {
    this.errorMessage = "";
    this.popup.close();
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

  protected async updated() {
    await this.updateComplete;
    this.renderGoogleButton();
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
        @auth-mode-switch=${(e: AuthModeSwitchEvent) =>
          this.handleSwitchMode(e.mode)}
        @auth-login=${(e: AuthLoginEvent) =>
          this.handleLogin(e.email, e.password)}
        @auth-signup=${(e: AuthSignupEvent) =>
          this.handleSignup(e.email, e.password)}
      ></identity-auth-popup>
    `;
  }

  static styles = [baseStyle];
}
