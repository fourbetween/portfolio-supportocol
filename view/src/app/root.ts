import { Router } from "@lit-labs/router";
import { provide } from "@lit/context";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "urlpattern-polyfill";
import "../feature/identity/component/auth-widget";
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
      enter: async () => {
        await import("../feature/dialogue/root");
        return true;
      },
      render: () => html`
        <dialogue-root></dialogue-root>
      `,
    },
    {
      path: "/learning/*",
      enter: async () => {
        await import("../feature/learning/root");
        return true;
      },
      render: () => html`
        <learning-root></learning-root>
      `,
    },
    {
      path: "/*",
      enter: async () => {
        await import("../feature/marketing/root");
        return true;
      },
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
