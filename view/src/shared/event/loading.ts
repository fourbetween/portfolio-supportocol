export const LOADING_SHOW_EVENT_NAME = "loading-show";

export class LoadingShowEvent extends Event {
  public readonly show: boolean;
  public readonly progress?: number;

  constructor(show: boolean, progress?: number) {
    super(LOADING_SHOW_EVENT_NAME, { bubbles: true, composed: true });
    this.show = show;
    this.progress = progress;
  }
}

declare global {
  interface HTMLElementEventMap {
    [LOADING_SHOW_EVENT_NAME]: LoadingShowEvent;
  }
}

export function showLoading(
  element: HTMLElement,
  show: boolean,
  progress?: number
): void {
  element.dispatchEvent(new LoadingShowEvent(show, progress));
}
