export const OPEN_AUTH_POPUP_EVENT_NAME = "open-auth-popup";

declare global {
  interface HTMLElementEventMap {
    [OPEN_AUTH_POPUP_EVENT_NAME]: CustomEvent<void>;
  }
}

export function openAuthPopup(element: HTMLElement): void {
  element.dispatchEvent(
    new CustomEvent(OPEN_AUTH_POPUP_EVENT_NAME, {
      bubbles: true,
      composed: true,
    })
  );
}
