import type { ToastType } from "../component/presenter/toast/base";

export interface ToastEventDetail {
  message: string;
  type: ToastType;
  duration?: number;
}

export const SHOW_TOAST_EVENT_NAME = "show-toast";

declare global {
  interface HTMLElementEventMap {
    [SHOW_TOAST_EVENT_NAME]: CustomEvent<ToastEventDetail>;
  }
}

export function showToast(
  element: HTMLElement,
  message: string,
  type: ToastType,
  duration?: number
): void {
  element.dispatchEvent(
    new CustomEvent(SHOW_TOAST_EVENT_NAME, {
      bubbles: true,
      composed: true,
      detail: {
        message,
        type,
        duration,
      },
    })
  );
}
