import { Router } from "@lit-labs/router";
import { provide } from "@lit/context";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "urlpattern-polyfill";
import "../feature/dialogue/root";
import "../feature/identity/component/auth-widget";
import "../feature/learning/root";
import "../feature/marketing/root";
import "../shared/ui/loading/loading-manager";
import "../shared/ui/toast/toast-manager";
import { routerContext } from "./context/router";
import "./layout/layout";

@customElement("app-root")
export class AppRoot extends LitElement {
  @provide({ context: routerContext })
  private router = new Router(this, [
    {
      path: "/dialogue/*",
      render: () => html`
        <dialogue-root></dialogue-root>
      `,
    },
    {
      path: "/learning/*",
      render: () => html`
        <learning-root></learning-root>
      `,
    },
    {
      path: "/*",
      render: () => html`
        <marketing-root></marketing-root>
      `,
    },
  ]);

  render() {
    return html`
      <app-layout>${this.router.outlet()}</app-layout>
      <toast-manager></toast-manager>
      <loading-manager></loading-manager>
      <identity-auth-widget></identity-auth-widget>
    `;
  }
}
