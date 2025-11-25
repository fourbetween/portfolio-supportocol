import { Router } from "@lit-labs/router";
import { provide } from "@lit/context";
import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "urlpattern-polyfill";
import "./auth";
import { routerContext } from "./context/router";
import "./import";
import { accountMethods } from "./model/account";
import { baseStyle } from "./style/base";

@customElement("app-root")
export class AppRoot extends LitElement {
  @state()
  private isLoggedIn = false;

  @provide({ context: routerContext })
  private router = new Router(this, [
    {
      path: "/",
      render: () => html`
        <front-page-container
          .isLoggedIn=${this.isLoggedIn}
        ></front-page-container>
      `,
    },
    {
      path: "/dashboard",
      render: () => html`
        <dashboard-page-container></dashboard-page-container>
      `,
    },
  ]);

  constructor() {
    super();
    new Task(this, {
      task: async ([]) => {
        this.isLoggedIn = await accountMethods.isLoggedIn();
      },
      args: () => [],
    });
  }

  render() {
    return html`
      <main-layout-container>${this.router.outlet()}</main-layout-container>
    `;
  }

  static styles = [baseStyle, css``];
}
