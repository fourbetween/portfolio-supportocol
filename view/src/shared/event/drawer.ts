export const DRAWER_CLOSE_EVENT_NAME = "ui-drawer-close";

export class DrawerCloseEvent extends Event {
  constructor() {
    super(DRAWER_CLOSE_EVENT_NAME, { bubbles: true, composed: true });
  }
}

declare global {
  interface HTMLElementEventMap {
    [DRAWER_CLOSE_EVENT_NAME]: DrawerCloseEvent;
  }
}
