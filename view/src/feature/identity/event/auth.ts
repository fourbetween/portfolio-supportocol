export type AuthMode = "login" | "signup";

const AUTH_POPUP_OPEN_EVENT_NAME = "auth-popup-open";
const AUTH_MODE_SWITCH_EVENT_NAME = "auth-mode-switch";
const AUTH_LOGIN_EVENT_NAME = "auth-login";
const AUTH_SIGNUP_EVENT_NAME = "auth-signup";

export class AuthPopupOpenEvent extends Event {
  constructor() {
    super(AUTH_POPUP_OPEN_EVENT_NAME, { bubbles: true, composed: true });
  }
}

export class AuthModeSwitchEvent extends Event {
  public readonly mode: AuthMode;

  constructor(mode: AuthMode) {
    super(AUTH_MODE_SWITCH_EVENT_NAME, { bubbles: true, composed: true });
    this.mode = mode;
  }
}

export class AuthLoginEvent extends Event {
  public readonly email: string;
  public readonly password: string;

  constructor(email: string, password: string) {
    super(AUTH_LOGIN_EVENT_NAME, { bubbles: true, composed: true });
    this.email = email;
    this.password = password;
  }
}

export class AuthSignupEvent extends Event {
  public readonly email: string;
  public readonly password: string;

  constructor(email: string, password: string) {
    super(AUTH_SIGNUP_EVENT_NAME, { bubbles: true, composed: true });
    this.email = email;
    this.password = password;
  }
}

declare global {
  interface HTMLElementEventMap {
    [AUTH_POPUP_OPEN_EVENT_NAME]: AuthPopupOpenEvent;
    [AUTH_MODE_SWITCH_EVENT_NAME]: AuthModeSwitchEvent;
    [AUTH_LOGIN_EVENT_NAME]: AuthLoginEvent;
    [AUTH_SIGNUP_EVENT_NAME]: AuthSignupEvent;
  }
}
