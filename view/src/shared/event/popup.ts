export const POPUP_CLOSED_EVENT_NAME = "popup-closed";

export class PopupClosedEvent extends Event {
  constructor() {
    super(POPUP_CLOSED_EVENT_NAME, { bubbles: true, composed: true });
  }
}

declare global {
  interface HTMLElementEventMap {
    [POPUP_CLOSED_EVENT_NAME]: PopupClosedEvent;
  }
}
