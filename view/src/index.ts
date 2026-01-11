import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "urlpattern-polyfill";
import "./app/root";

@customElement("supportocol-root")
export class SupportocolRoot extends LitElement {
  render() {
    return html`
      <app-root></app-root>
    `;
  }
}
