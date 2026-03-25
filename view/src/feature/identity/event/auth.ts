export type AuthMode = "login" | "signup";

export class IdentityAuthPopupOpenEvent extends Event {
  static get eventName() { return "identity-auth-popup-open" as const; }
  constructor() {
    super(IdentityAuthPopupOpenEvent.eventName, {
      bubbles: true,
      composed: true,
    });
  }
}

export class IdentityAuthModeSwitchEvent extends Event {
  static get eventName() { return "identity-auth-mode-switch" as const; }
  public readonly mode: AuthMode;

  constructor(mode: AuthMode) {
    super(IdentityAuthModeSwitchEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.mode = mode;
  }
}

export class IdentityAuthLoginEvent extends Event {
  static get eventName() { return "identity-auth-login" as const; }
  public readonly email: string;
  public readonly password: string;

  constructor(email: string, password: string) {
    super(IdentityAuthLoginEvent.eventName, { bubbles: true, composed: true });
    this.email = email;
    this.password = password;
  }
}

export class IdentityAuthSignupEvent extends Event {
  static get eventName() { return "identity-auth-signup" as const; }
  public readonly email: string;
  public readonly password: string;

  constructor(email: string, password: string) {
    super(IdentityAuthSignupEvent.eventName, { bubbles: true, composed: true });
    this.email = email;
    this.password = password;
  }
}

export class IdentityResendVerifyEmailEvent extends Event {
  static get eventName() { return "identity-resend-verify-email" as const; }
  public readonly email: string;

  constructor(email: string) {
    super(IdentityResendVerifyEmailEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.email = email;
  }
}

export class IdentityRequestPasswordResetEvent extends Event {
  static get eventName() { return "identity-request-password-reset" as const; }
  public readonly email: string;

  constructor(email: string) {
    super(IdentityRequestPasswordResetEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.email = email;
  }
}

export class IdentityConfirmPasswordResetEvent extends Event {
  static get eventName() { return "identity-confirm-password-reset" as const; }
  public readonly token: string;
  public readonly newPassword: string;

  constructor(token: string, newPassword: string) {
    super(IdentityConfirmPasswordResetEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.token = token;
    this.newPassword = newPassword;
  }
}

declare global {
  interface HTMLElementEventMap {
    [IdentityAuthPopupOpenEvent.eventName]: IdentityAuthPopupOpenEvent;
    [IdentityAuthModeSwitchEvent.eventName]: IdentityAuthModeSwitchEvent;
    [IdentityAuthLoginEvent.eventName]: IdentityAuthLoginEvent;
    [IdentityAuthSignupEvent.eventName]: IdentityAuthSignupEvent;
    [IdentityResendVerifyEmailEvent.eventName]: IdentityResendVerifyEmailEvent;
    [IdentityRequestPasswordResetEvent.eventName]: IdentityRequestPasswordResetEvent;
    [IdentityConfirmPasswordResetEvent.eventName]: IdentityConfirmPasswordResetEvent;
  }
}
