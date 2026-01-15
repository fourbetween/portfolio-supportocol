import { Router } from "@lit-labs/router";
import { provide } from "@lit/context";
import { Task } from "@lit/task";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "urlpattern-polyfill";
import "../feature/dialogue/root";
import "../feature/identity/component/auth-widget";
import { authService } from "../feature/identity/model/auth-service";
import type { User } from "../feature/identity/model/user";
import "../feature/learning/root";
import "../feature/marketing/root";
import { showToast } from "../shared/event/toast";
import "../shared/ui/loading/loading-manager";
import "../shared/ui/toast/toast-manager";
import { routerContext } from "./context/router";
import { userContext } from "./context/user";
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

  @provide({ context: userContext })
  private user?: User;

  constructor() {
    super();

    this.user;
    new Task(this, {
      task: async () => {
        return authService.getCurrentUser();
      },
      onComplete: (user) => {
        this.user = user;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [],
    });
  }

  render() {
    return html`
      <app-layout>${this.router.outlet()}</app-layout>
      <toast-manager></toast-manager>
      <loading-manager></loading-manager>
      <identity-auth-widget></identity-auth-widget>
    `;
  }
}
