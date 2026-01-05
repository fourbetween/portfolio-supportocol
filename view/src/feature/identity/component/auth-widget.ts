import { LitElement, css, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { client } from "../api/client";
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

  @state()
  private googleInitialized = false;

  @query("identity-auth-popup")
  private popup!: IdentityAuthPopup;

  connectedCallback() {
    super.connectedCallback();
    this.initializeGoogleSignIn();
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

  private initializeGoogleSignIn() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not set");
      return;
    }

    // Google Identity Servicesがロードされるまで待機
    if (typeof google === "undefined" || !google.accounts) {
      setTimeout(() => this.initializeGoogleSignIn(), 100);
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => this.handleGoogleCallback(response),
    });
    this.googleInitialized = true;
  }

  private async handleGoogleCallback(
    response: google.accounts.id.CredentialResponse
  ) {
    this.isLoading = true;
    this.errorMessage = "";

    try {
      const { error } = await client.POST("/identity/google", {
        body: { idToken: response.credential },
      });

      if (error) {
        this.errorMessage = error.message || "Google authentication failed";
        return;
      }

      this.close();
      window.location.reload();
    } catch {
      this.errorMessage = "Google authentication failed";
    } finally {
      this.isLoading = false;
    }
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

  private renderGoogleButton(container: HTMLElement) {
    if (!this.googleInitialized || !container) {
      return;
    }

    container.innerHTML = "";

    google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: 280,
      text: this.currentMode === "signup" ? "signup_with" : "signin_with",
    });
  }

  protected async updated() {
    await this.updateComplete;
    this.renderGoogleButtonToPresenter();
  }

  private renderGoogleButtonToPresenter() {
    if (!this.googleInitialized) {
      return;
    }

    const presenter = this.popup;
    if (presenter) {
      const container = presenter.googleButtonContainer;
      if (container) {
        this.renderGoogleButton(container);
      }
    }
  }

  render() {
    return html`
      <identity-auth-popup
        .mode=${this.currentMode}
        .errorMessage=${this.errorMessage}
        @switch-mode=${(e: SwitchModeEvent) => this.handleSwitchMode(e.mode)}
        @login=${(e: LoginEvent) => this.handleLogin(e.email, e.password)}
        @signup=${(e: SignupEvent) => this.handleSignup(e.email, e.password)}
      ></identity-auth-popup>
      ${this.isLoading
        ? html`
            <div class="loading-overlay"></div>
          `
        : ""}
    `;
  }

  static styles = [
    baseStyle,
    css`
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.7);
        z-index: 1001;
        cursor: wait;
      }
    `,
  ];
}
