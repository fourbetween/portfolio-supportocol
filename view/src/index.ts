import { Router } from "@lit-labs/router";
import { provide } from "@lit/context";
import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import "urlpattern-polyfill";
import "./auth";
import type { BaseToastPresenter } from "./component/presenter/toast/base";
import { routerContext } from "./context/router";
import { ShowToastEvent } from "./event/toast";
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
        <home-page-presenter
          .isLoggedIn=${this.isLoggedIn}
        ></home-page-presenter>
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
      name: "project_item",
      path: routes.project_item,
      render: ({ id }) => html`
        <item-project-page-container
          .projectId=${id as string}
        ></item-project-page-container>
      `,
    },
    {
      name: "discussion_list",
      path: routes.discussion_list,
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
    {
      name: "discussion_item",
      path: routes.discussion_item,
      render: ({ id }) => html`
        <item-discussion-page-container
          .discussionId=${id as string}
        ></item-discussion-page-container>
      `,
    },
    {
      name: "rule_list",
      path: routes.rule_list,
      render: () => html`
        <list-rule-page-container></list-rule-page-container>
      `,
    },
    {
      name: "rule_new",
      path: routes.rule_new,
      render: () => html`
        <create-rule-page-container></create-rule-page-container>
      `,
    },
    {
      name: "rule_item",
      path: routes.rule_item,
      render: ({ id }) => html`
        <edit-rule-page-container
          .ruleId=${id as string}
        ></edit-rule-page-container>
      `,
    },
  ]);

  @query("base-toast-presenter")
  private toast!: BaseToastPresenter;

  constructor() {
    super();
    new Task(this, {
      task: async ([]) => {
        this.isLoggedIn = await accountMethods.isLoggedIn();
      },
      args: () => [],
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(ShowToastEvent.eventName, this.handleShowToast);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(ShowToastEvent.eventName, this.handleShowToast);
  }

  render() {
    return html`
      <main-layout-container>${this.router.outlet()}</main-layout-container>
      <base-toast-presenter></base-toast-presenter>
    `;
  }

  private handleShowToast = (event: ShowToastEvent) => {
    this.toast.show({
      message: event.detail.message,
      type: event.detail.type,
      duration: event.detail.duration,
    });
  };

  static styles = [baseStyle, css``];
}
