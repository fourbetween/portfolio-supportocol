export class PopupClosedEvent extends Event {
  static get eventName() { return "popup-closed" as const; }
  constructor() {
    super(PopupClosedEvent.eventName, { bubbles: true, composed: true });
  }
}

declare global {
  interface HTMLElementEventMap {
    [PopupClosedEvent.eventName]: PopupClosedEvent;
  }
}
