export const LOADING_EVENT_NAME = "loading";

export class LoadingEvent extends Event {
  public readonly show: boolean;
  public readonly progress?: number;

  constructor(show: boolean, progress?: number) {
    super(LOADING_EVENT_NAME, { bubbles: true, composed: true });
    this.show = show;
    this.progress = progress;
  }
}

declare global {
  interface HTMLElementEventMap {
    [LOADING_EVENT_NAME]: LoadingEvent;
  }
}

export function showLoading(
  element: HTMLElement,
  show: boolean,
  progress?: number
): void {
  element.dispatchEvent(new LoadingEvent(show, progress));
}
