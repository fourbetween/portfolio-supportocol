import type { ToastType } from "../ui/toast/toast";

const SHOW_TOAST_EVENT_NAME = "show-toast";

export class ShowToastEvent extends Event {
  public readonly message: string;
  public readonly toastType: ToastType;
  public readonly duration?: number;

  constructor(message: string, toastType: ToastType, duration?: number) {
    super(SHOW_TOAST_EVENT_NAME, { bubbles: true, composed: true });
    this.message = message;
    this.toastType = toastType;
    this.duration = duration;
  }
}

declare global {
  interface HTMLElementEventMap {
    [SHOW_TOAST_EVENT_NAME]: ShowToastEvent;
  }
}

export function showToast(
  element: HTMLElement,
  message: string,
  type: ToastType,
  duration?: number
): void {
  element.dispatchEvent(new ShowToastEvent(message, type, duration));
}
