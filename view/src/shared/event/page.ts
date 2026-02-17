const PAGE_CHANGE_EVENT_NAME = "page-change";

export class PageChangeEvent extends Event {
  public readonly page: number;

  constructor(page: number) {
    super(PAGE_CHANGE_EVENT_NAME, { bubbles: true, composed: true });
    this.page = page;
  }
}

declare global {
  interface HTMLElementEventMap {
    [PAGE_CHANGE_EVENT_NAME]: PageChangeEvent;
  }
}
