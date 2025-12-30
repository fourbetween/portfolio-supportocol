import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import {
  SHOW_TOAST_EVENT_NAME,
  type ToastEventDetail,
} from "../../event/toast";
import "./toast";
import type { Toast } from "./toast";

@customElement("toast-manager")
export class ToastManager extends LitElement {
  @query("ui-toast")
  private toast!: Toast;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(
      SHOW_TOAST_EVENT_NAME,
      this.handleShowToast as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(
      SHOW_TOAST_EVENT_NAME,
      this.handleShowToast as EventListener
    );
  }

  render() {
    return html`
      <ui-toast></ui-toast>
    `;
  }

  private handleShowToast = (event: CustomEvent<ToastEventDetail>) => {
    this.toast.show({
      message: event.detail.message,
      type: event.detail.type,
      duration: event.detail.duration,
    });
  };
}
