export type AuthMode = "login" | "signup";

const IDENTITY_AUTH_POPUP_OPEN_EVENT_NAME = "identity-auth-popup-open";
const IDENTITY_AUTH_MODE_SWITCH_EVENT_NAME = "identity-auth-mode-switch";
const IDENTITY_AUTH_LOGIN_EVENT_NAME = "identity-auth-login";
const IDENTITY_AUTH_SIGNUP_EVENT_NAME = "identity-auth-signup";
const IDENTITY_RESEND_VERIFY_EMAIL_EVENT_NAME = "identity-resend-verify-email";
const IDENTITY_REQUEST_PASSWORD_RESET_EVENT_NAME =
  "identity-request-password-reset";
const IDENTITY_CONFIRM_PASSWORD_RESET_EVENT_NAME =
  "identity-confirm-password-reset";

export class IdentityAuthPopupOpenEvent extends Event {
  constructor() {
    super(IDENTITY_AUTH_POPUP_OPEN_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
  }
}

export class IdentityAuthModeSwitchEvent extends Event {
  public readonly mode: AuthMode;

  constructor(mode: AuthMode) {
    super(IDENTITY_AUTH_MODE_SWITCH_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.mode = mode;
  }
}

export class IdentityAuthLoginEvent extends Event {
  public readonly email: string;
  public readonly password: string;

  constructor(email: string, password: string) {
    super(IDENTITY_AUTH_LOGIN_EVENT_NAME, { bubbles: true, composed: true });
    this.email = email;
    this.password = password;
  }
}

export class IdentityAuthSignupEvent extends Event {
  public readonly email: string;
  public readonly password: string;

  constructor(email: string, password: string) {
    super(IDENTITY_AUTH_SIGNUP_EVENT_NAME, { bubbles: true, composed: true });
    this.email = email;
    this.password = password;
  }
}

export class IdentityResendVerifyEmailEvent extends Event {
  public readonly email: string;

  constructor(email: string) {
    super(IDENTITY_RESEND_VERIFY_EMAIL_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.email = email;
  }
}

export class IdentityRequestPasswordResetEvent extends Event {
  public readonly email: string;

  constructor(email: string) {
    super(IDENTITY_REQUEST_PASSWORD_RESET_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.email = email;
  }
}

export class IdentityConfirmPasswordResetEvent extends Event {
  public readonly token: string;
  public readonly newPassword: string;

  constructor(token: string, newPassword: string) {
    super(IDENTITY_CONFIRM_PASSWORD_RESET_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.token = token;
    this.newPassword = newPassword;
  }
}

declare global {
  interface HTMLElementEventMap {
    [IDENTITY_AUTH_POPUP_OPEN_EVENT_NAME]: IdentityAuthPopupOpenEvent;
    [IDENTITY_AUTH_MODE_SWITCH_EVENT_NAME]: IdentityAuthModeSwitchEvent;
    [IDENTITY_AUTH_LOGIN_EVENT_NAME]: IdentityAuthLoginEvent;
    [IDENTITY_AUTH_SIGNUP_EVENT_NAME]: IdentityAuthSignupEvent;
    [IDENTITY_RESEND_VERIFY_EMAIL_EVENT_NAME]: IdentityResendVerifyEmailEvent;
    [IDENTITY_REQUEST_PASSWORD_RESET_EVENT_NAME]: IdentityRequestPasswordResetEvent;
    [IDENTITY_CONFIRM_PASSWORD_RESET_EVENT_NAME]: IdentityConfirmPasswordResetEvent;
  }
}
