const IDENTITY_ACCOUNT_DELETE_EVENT_NAME = "identity-account-delete";
const IDENTITY_LOGOUT_EVENT_NAME = "identity-logout";
const IDENTITY_CHANGE_PASSWORD_EVENT_NAME = "identity-change-password";

export class IdentityAccountDeleteEvent extends Event {
  constructor() {
    super(IDENTITY_ACCOUNT_DELETE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
  }
}

export class IdentityLogoutEvent extends Event {
  constructor() {
    super(IDENTITY_LOGOUT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
  }
}

export class IdentityChangePasswordEvent extends Event {
  public readonly currentPassword: string;
  public readonly newPassword: string;

  constructor(currentPassword: string, newPassword: string) {
    super(IDENTITY_CHANGE_PASSWORD_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.currentPassword = currentPassword;
    this.newPassword = newPassword;
  }
}

declare global {
  interface HTMLElementEventMap {
    [IDENTITY_ACCOUNT_DELETE_EVENT_NAME]: IdentityAccountDeleteEvent;
    [IDENTITY_LOGOUT_EVENT_NAME]: IdentityLogoutEvent;
    [IDENTITY_CHANGE_PASSWORD_EVENT_NAME]: IdentityChangePasswordEvent;
  }
}
