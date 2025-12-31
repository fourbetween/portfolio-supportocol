import { Router } from "@lit-labs/router";
import { provide } from "@lit/context";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "urlpattern-polyfill";
import { routerContext } from "./app/context/router";
import { userContext } from "./app/context/user";
import "./app/layout/layout";
import { routes } from "./app/routes";
import "./feature/identity/component/auth-widget";
import type { User } from "./feature/identity/model/user";
import { auth } from "./feature/identity/util/auth";
import "./shared/ui/loading/loading-manager";
import "./shared/ui/toast/toast-manager";

@customElement("app-root")
export class AppRoot extends LitElement {
  @provide({ context: routerContext })
  private router = new Router(this, [
    {
      name: "home",
      path: routes.home,
      enter: async () => {
        await import("./feature/marketing/page/home-page");
        return true;
      },
      render: () => html`
        <marketing-home-page></marketing-home-page>
      `,
    },
    {
      name: "dashboard",
      path: routes.dashboard,
      enter: async () => {
        await import("./feature/learning/page/dashboard-page");
        return true;
      },
      render: () => html`
        <learning-dashboard-page></learning-dashboard-page>
      `,
    },
  ]);

  @provide({ context: userContext })
  @state()
  private user: User | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.fetchCurrentUser();
  }

  render() {
    void this.user;
    return html`
      <app-layout>${this.router.outlet()}</app-layout>
      <toast-manager></toast-manager>
      <loading-manager></loading-manager>
      <identity-auth-widget></identity-auth-widget>
    `;
  }

  private async fetchCurrentUser() {
    this.user = await auth.getCurrentUser();
  }

  static styles = [
    css`
      :host {
        display: block;
        height: 100vh;
      }
    `,
  ];
}
