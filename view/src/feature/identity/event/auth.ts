const OPEN_AUTH_POPUP_EVENT_NAME = "open-auth-popup";

export class OpenAuthPopupEvent extends Event {
  constructor() {
    super(OPEN_AUTH_POPUP_EVENT_NAME, { bubbles: true, composed: true });
  }
}

declare global {
  interface HTMLElementEventMap {
    [OPEN_AUTH_POPUP_EVENT_NAME]: OpenAuthPopupEvent;
  }
}
