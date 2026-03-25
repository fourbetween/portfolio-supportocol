import type { ToastType } from "../ui/toast/toast";

export class ToastShowEvent extends Event {
  static get eventName() { return "toast-show" as const; }
  public readonly message: string;
  public readonly toastType: ToastType;
  public readonly duration?: number;

  constructor(message: string, toastType: ToastType, duration?: number) {
    super(ToastShowEvent.eventName, { bubbles: true, composed: true });
    this.message = message;
    this.toastType = toastType;
    this.duration = duration;
  }
}

declare global {
  interface HTMLElementEventMap {
    [ToastShowEvent.eventName]: ToastShowEvent;
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
