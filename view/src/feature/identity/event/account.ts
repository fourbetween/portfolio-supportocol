const IDENTITY_ACCOUNT_DELETE_EVENT_NAME = "identity-account-delete";
const IDENTITY_LOGOUT_EVENT_NAME = "identity-logout";

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

declare global {
  interface HTMLElementEventMap {
    [IDENTITY_ACCOUNT_DELETE_EVENT_NAME]: IdentityAccountDeleteEvent;
    [IDENTITY_LOGOUT_EVENT_NAME]: IdentityLogoutEvent;
  }
}
