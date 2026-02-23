const IDENTITY_ACCOUNT_DELETE_EVENT_NAME = "identity-account-delete";

export class IdentityAccountDeleteEvent extends Event {
  constructor() {
    super(IDENTITY_ACCOUNT_DELETE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
  }
}

declare global {
  interface HTMLElementEventMap {
    [IDENTITY_ACCOUNT_DELETE_EVENT_NAME]: IdentityAccountDeleteEvent;
  }
}
