import { Router } from "@lit-labs/router";
import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "urlpattern-polyfill";
import "./auth";
import "./import";
import { accountMethods } from "./model/account";
import { baseStyle } from "./style/base";

@customElement("app-root")
export class AppRoot extends LitElement {
  @state()
  private isLoggedIn = false;

  constructor() {
    super();
    new Task(this, {
      task: async ([]) => {
        this.isLoggedIn = await accountMethods.isLoggedIn();
      },
      args: () => [],
    });
  }

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
        <dashboard-page-container
          .isLoggedIn=${this.isLoggedIn}
        ></dashboard-page-container>
      `,
    },
    {
      path: "/projects",
      render: () => html`
        <projects-page-container
          .isLoggedIn=${this.isLoggedIn}
        ></projects-page-container>
      `,
    },
    {
      path: "/discussions",
      render: () => html`
        <discussions-page-container
          .isLoggedIn=${this.isLoggedIn}
        ></discussions-page-container>
      `,
    },
    {
      path: "/rules",
      render: () => html`
        <rules-page-container
          .isLoggedIn=${this.isLoggedIn}
        ></rules-page-container>
      `,
    },
  ]);

  render() {
    return html`
      <main-layout-container @navigate=${this.handleNavigate}>
        ${this.router.outlet()}
      </main-layout-container>
    `;
  }

  private async handleNavigate(e: CustomEvent) {
    await this.router.goto(e.detail.path);
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    url.pathname = e.detail.path;
    window.history.pushState({}, "", url.toString());
  }

  static styles = [baseStyle, css``];
}
