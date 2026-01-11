export type AuthMode = "login" | "signup";

const IDENTITY_AUTH_POPUP_OPEN_EVENT_NAME = "identity-auth-popup-open";
const IDENTITY_AUTH_MODE_SWITCH_EVENT_NAME = "identity-auth-mode-switch";
const IDENTITY_AUTH_LOGIN_EVENT_NAME = "identity-auth-login";
const IDENTITY_AUTH_SIGNUP_EVENT_NAME = "identity-auth-signup";

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

declare global {
  interface HTMLElementEventMap {
    [IDENTITY_AUTH_POPUP_OPEN_EVENT_NAME]: IdentityAuthPopupOpenEvent;
    [IDENTITY_AUTH_MODE_SWITCH_EVENT_NAME]: IdentityAuthModeSwitchEvent;
    [IDENTITY_AUTH_LOGIN_EVENT_NAME]: IdentityAuthLoginEvent;
    [IDENTITY_AUTH_SIGNUP_EVENT_NAME]: IdentityAuthSignupEvent;
  }
}
