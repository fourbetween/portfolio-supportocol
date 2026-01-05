import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { GoogleAuthService } from "../api/google-auth";
import {
  LoginEvent,
  SignupEvent,
  SwitchModeEvent,
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
    document.addEventListener("open-auth-popup", this.handleOpenAuthPopup);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("open-auth-popup", this.handleOpenAuthPopup);
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
        @switch-mode=${(e: SwitchModeEvent) => this.handleSwitchMode(e.mode)}
        @login=${(e: LoginEvent) => this.handleLogin(e.email, e.password)}
        @signup=${(e: SignupEvent) => this.handleSignup(e.email, e.password)}
      ></identity-auth-popup>
    `;
  }

  static styles = [baseStyle];
}
