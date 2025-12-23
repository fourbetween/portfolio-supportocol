import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import {
  SHOW_TOAST_EVENT_NAME,
  type ToastEventDetail,
} from "../../event/toast";
import type { BaseToastPresenter } from "../presenter/toast/base";

@customElement("toast-container")
export class ToastContainer extends LitElement {
  @query("base-toast-presenter")
  private toast!: BaseToastPresenter;

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
      <base-toast-presenter></base-toast-presenter>
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
