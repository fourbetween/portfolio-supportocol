export class PageChangeEvent extends Event {
  static get eventName() { return "page-change" as const; }
  public readonly page: number;

  constructor(page: number) {
    super(PageChangeEvent.eventName, { bubbles: true, composed: true });
    this.page = page;
  }
}

declare global {
  interface HTMLElementEventMap {
    [PageChangeEvent.eventName]: PageChangeEvent;
  }
}
