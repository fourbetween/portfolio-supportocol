import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { LoadingEvent } from "../../event/loading";
import "./loading";

@customElement("loading-manager")
export class LoadingManager extends LitElement {
  @state()
  private show = false;

  @state()
  private progress?: number;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("loading", this.handleLoading as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(
      "loading",
      this.handleLoading as EventListener
    );
  }

  render() {
    return html`
      <ui-loading .show=${this.show} .progress=${this.progress}></ui-loading>
    `;
  }

  private handleLoading = (event: LoadingEvent) => {
    this.show = event.show;
    this.progress = event.progress;
  };
}
