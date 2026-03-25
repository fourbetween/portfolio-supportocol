export class IdentityAccountDeleteEvent extends Event {
  static get eventName() { return "identity-account-delete" as const; }
  constructor() {
    super(IdentityAccountDeleteEvent.eventName, {
      bubbles: true,
      composed: true,
    });
  }
}

export class IdentityLogoutEvent extends Event {
  static get eventName() { return "identity-logout" as const; }
  constructor() {
    super(IdentityLogoutEvent.eventName, {
      bubbles: true,
      composed: true,
    });
  }
}

export class IdentityChangePasswordEvent extends Event {
  static get eventName() { return "identity-change-password" as const; }
  public readonly currentPassword: string;
  public readonly newPassword: string;

  constructor(currentPassword: string, newPassword: string) {
    super(IdentityChangePasswordEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.currentPassword = currentPassword;
    this.newPassword = newPassword;
  }
}

declare global {
  interface HTMLElementEventMap {
    [IdentityAccountDeleteEvent.eventName]: IdentityAccountDeleteEvent;
    [IdentityLogoutEvent.eventName]: IdentityLogoutEvent;
    [IdentityChangePasswordEvent.eventName]: IdentityChangePasswordEvent;
  }
}
