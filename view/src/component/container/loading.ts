import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  LOADING_EVENT_NAME,
  type LoadingEventDetail,
} from "../../event/loading";

@customElement("loading-container")
export class LoadingContainer extends LitElement {
  @state()
  private show = false;

  @state()
  private progress?: number;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(
      LOADING_EVENT_NAME,
      this.handleLoading as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(
      LOADING_EVENT_NAME,
      this.handleLoading as EventListener
    );
  }

  render() {
    return html`
      <base-loading-presenter
        .show=${this.show}
        .progress=${this.progress}
      ></base-loading-presenter>
    `;
  }

  private handleLoading = (event: CustomEvent<LoadingEventDetail>) => {
    this.show = event.detail.show;
    this.progress = event.detail.progress;
  };
}
