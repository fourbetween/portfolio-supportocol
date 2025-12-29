export interface LoadingEventDetail {
  show: boolean;
  progress?: number; // 0 to 100
}

export const LOADING_EVENT_NAME = "loading";

declare global {
  interface HTMLElementEventMap {
    [LOADING_EVENT_NAME]: CustomEvent<LoadingEventDetail>;
  }
}

export function showLoading(
  element: HTMLElement,
  show: boolean,
  progress?: number
): void {
  element.dispatchEvent(
    new CustomEvent(LOADING_EVENT_NAME, {
      bubbles: true,
      composed: true,
      detail: {
        show,
        progress,
      },
    })
  );
}
