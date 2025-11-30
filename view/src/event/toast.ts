import type { ToastType } from "../component/presenter/toast/base";

export interface ToastEventDetail {
  message: string;
  type: ToastType;
  duration?: number;
}

export class ShowToastEvent extends CustomEvent<ToastEventDetail> {
  static readonly eventName = "show-toast" as const;

  constructor(detail: ToastEventDetail) {
    super(ShowToastEvent.eventName, {
      bubbles: true,
      composed: true,
      detail,
    });
  }
}

declare global {
  interface HTMLElementEventMap {
    [ShowToastEvent.eventName]: ShowToastEvent;
  }
}

export function showErrorToast(element: HTMLElement, message: string): void {
  console.error(message);
  element.dispatchEvent(
    new ShowToastEvent({
      message,
      type: "error",
      duration: 5000,
    })
  );
}
