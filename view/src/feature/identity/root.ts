import { Routes } from "@lit-labs/router";
import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { pathInFeature, paths } from "../../app/paths";
import { authService } from "./model/auth-service";

@customElement("identity-root")
export class IdentityRoot extends LitElement {
  private _routes = new Routes(
    this,
    [
      {
        path: pathInFeature(paths.identity.account),
        enter: async () => {
          await import("./page/account-page");
          return authService.requireAuth();
        },
        render: () => html`
          <identity-account-page></identity-account-page>
        `,
      },
      {
        path: pathInFeature(paths.identity.verifyEmail),
        enter: async () => {
          await import("./page/verify-email-page");
          return true;
        },
        render: () => html`
          <identity-verify-email-page></identity-verify-email-page>
        `,
      },
      {
        path: pathInFeature(paths.identity.checkEmail),
        enter: async () => {
          await import("./page/check-email-page");
          return true;
        },
        render: () => html`
          <identity-check-email-page></identity-check-email-page>
        `,
      },
    ],
    {
      fallback: {
        render: () => nothing,
      },
    },
  );

  render() {
    return html`
      ${this._routes.outlet()}
    `;
  }
}
