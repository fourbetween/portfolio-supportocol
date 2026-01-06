import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { TOAST_SHOW_EVENT_NAME, ToastShowEvent } from "../../event/toast";
import "./toast";
import type { Toast } from "./toast";

@customElement("toast-manager")
export class ToastManager extends LitElement {
  @query("ui-toast")
  private toast!: Toast;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(
      TOAST_SHOW_EVENT_NAME,
      this.handleShowToast as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(
      TOAST_SHOW_EVENT_NAME,
      this.handleShowToast as EventListener
    );
  }

  render() {
    return html`
      <ui-toast></ui-toast>
    `;
  }

  private handleShowToast = (event: ToastShowEvent) => {
    this.toast.show({
      message: event.message,
      type: event.toastType,
      duration: event.duration,
    });
  };
}
