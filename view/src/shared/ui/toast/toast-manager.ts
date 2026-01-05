import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { ShowToastEvent } from "../../event/toast";
import "./toast";
import type { Toast } from "./toast";

@customElement("toast-manager")
export class ToastManager extends LitElement {
  @query("ui-toast")
  private toast!: Toast;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(
      "show-toast",
      this.handleShowToast as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(
      "show-toast",
      this.handleShowToast as EventListener
    );
  }

  render() {
    return html`
      <ui-toast></ui-toast>
    `;
  }

  private handleShowToast = (event: ShowToastEvent) => {
    this.toast.show({
      message: event.message,
      type: event.toastType,
      duration: event.duration,
    });
  };
}
