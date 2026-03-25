export class LoadingShowEvent extends Event {
  static get eventName() { return "loading-show" as const; }
  public readonly show: boolean;
  public readonly progress?: number;

  constructor(show: boolean, progress?: number) {
    super(LoadingShowEvent.eventName, { bubbles: true, composed: true });
    this.show = show;
    this.progress = progress;
  }
}

declare global {
  interface HTMLElementEventMap {
    [LoadingShowEvent.eventName]: LoadingShowEvent;
  }
}

export function showLoading(
  element: HTMLElement,
  show: boolean,
  progress?: number
): void {
  element.dispatchEvent(new LoadingShowEvent(show, progress));
}
