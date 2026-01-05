const POPUP_CLOSE_EVENT_NAME = "close";

export class PopupCloseEvent extends Event {
  constructor() {
    super(POPUP_CLOSE_EVENT_NAME, { bubbles: true, composed: true });
  }
}

declare global {
  interface HTMLElementEventMap {
    [POPUP_CLOSE_EVENT_NAME]: PopupCloseEvent;
  }
}
