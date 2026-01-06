import type { ToastType } from "../ui/toast/toast";

export const TOAST_SHOW_EVENT_NAME = "toast-show";

export class ToastShowEvent extends Event {
  public readonly message: string;
  public readonly toastType: ToastType;
  public readonly duration?: number;

  constructor(message: string, toastType: ToastType, duration?: number) {
    super(TOAST_SHOW_EVENT_NAME, { bubbles: true, composed: true });
    this.message = message;
    this.toastType = toastType;
    this.duration = duration;
  }
}

declare global {
  interface HTMLElementEventMap {
    [TOAST_SHOW_EVENT_NAME]: ToastShowEvent;
  }
}

export function showToast(
  element: HTMLElement,
  message: string,
  type: ToastType,
  duration?: number
): void {
  element.dispatchEvent(new ToastShowEvent(message, type, duration));
}
