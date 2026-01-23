import { client } from "./client";

export interface GoogleAuthOptions {
  clientId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
  onLoading: (isLoading: boolean) => void;
  onInitialized?: () => void;
}

export class GoogleAuthService {
  private initialized = false;

  private options: GoogleAuthOptions;

  constructor(options: GoogleAuthOptions) {
    this.options = options;
  }

  initialize() {
    if (this.initialized) return;

    if (typeof google === "undefined" || !google.accounts) {
      setTimeout(() => this.initialize(), 100);
      return;
    }

    google.accounts.id.initialize({
      client_id: this.options.clientId,
      callback: (response) => this.handleCallback(response),
    });
    this.initialized = true;
    this.options.onInitialized?.();
  }

  renderButton(container: HTMLElement, mode: "login" | "signup") {
    if (!this.initialized || !container) return;

    container.innerHTML = "";
    google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: 280,
      text: mode === "signup" ? "signup_with" : "signin_with",
    });
  }

  private async handleCallback(
    response: google.accounts.id.CredentialResponse
  ) {
    this.options.onLoading(true);
    try {
      const { error } = await client.POST("/v1/identity/google", {
        body: { idToken: response.credential },
      });

      if (error) {
        this.options.onError(error.message || "Google authentication failed");
        return;
      }

      this.options.onSuccess();
    } catch {
      this.options.onError("Google authentication failed");
    } finally {
      this.options.onLoading(false);
    }
  }

  isInitialized() {
    return this.initialized;
  }
}
