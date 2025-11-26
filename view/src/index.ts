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
import { routes } from "./routes";
import { baseStyle } from "./style/base";

@customElement("app-root")
export class AppRoot extends LitElement {
  @state()
  private isLoggedIn = false;

  @provide({ context: routerContext })
  private router = new Router(this, [
    {
      name: "front",
      path: routes.front,
      render: () => html`
        <front-page-container
          .isLoggedIn=${this.isLoggedIn}
        ></front-page-container>
      `,
    },
    {
      name: "dashboard",
      path: routes.dashboard,
      render: () => html`
        <dashboard-page-container></dashboard-page-container>
      `,
    },
    {
      name: "project",
      path: routes.project,
      render: ({ id }) => html`
        <item-project-page-container
          .projectId=${id as string}
        ></item-project-page-container>
      `,
    },
    {
      name: "discussions",
      path: routes.discussions,
      render: () => html`
        <list-discussion-page-container></list-discussion-page-container>
      `,
    },
    {
      name: "discussion_new",
      path: routes.discussion_new,
      render: () => html`
        <create-discussion-page-container></create-discussion-page-container>
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
