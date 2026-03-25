export class DrawerCloseEvent extends Event {
  static get eventName() { return "drawer-close" as const; }
  constructor() {
    super(DrawerCloseEvent.eventName, { bubbles: true, composed: true });
  }
}

declare global {
  interface HTMLElementEventMap {
    [DrawerCloseEvent.eventName]: DrawerCloseEvent;
  }
}
