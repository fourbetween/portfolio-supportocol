export type AuthMode = "login" | "signup";

const OPEN_AUTH_POPUP_EVENT_NAME = "open-auth-popup";
const SWITCH_MODE_EVENT_NAME = "switch-mode";
const LOGIN_EVENT_NAME = "login";
const SIGNUP_EVENT_NAME = "signup";

export class OpenAuthPopupEvent extends Event {
  constructor() {
    super(OPEN_AUTH_POPUP_EVENT_NAME, { bubbles: true, composed: true });
  }
}

export class SwitchModeEvent extends Event {
  public readonly mode: AuthMode;

  constructor(mode: AuthMode) {
    super(SWITCH_MODE_EVENT_NAME, { bubbles: true, composed: true });
    this.mode = mode;
  }
}

export class LoginEvent extends Event {
  public readonly email: string;
  public readonly password: string;

  constructor(email: string, password: string) {
    super(LOGIN_EVENT_NAME, { bubbles: true, composed: true });
    this.email = email;
    this.password = password;
  }
}

export class SignupEvent extends Event {
  public readonly email: string;
  public readonly password: string;

  constructor(email: string, password: string) {
    super(SIGNUP_EVENT_NAME, { bubbles: true, composed: true });
    this.email = email;
    this.password = password;
  }
}

declare global {
  interface HTMLElementEventMap {
    [OPEN_AUTH_POPUP_EVENT_NAME]: OpenAuthPopupEvent;
    [SWITCH_MODE_EVENT_NAME]: SwitchModeEvent;
    [LOGIN_EVENT_NAME]: LoginEvent;
    [SIGNUP_EVENT_NAME]: SignupEvent;
  }
}
