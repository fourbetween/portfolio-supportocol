import { Routes } from "@lit-labs/router";
import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { pathInFeature, paths } from "../../app/paths";
import { authService } from "../identity/model/auth-service";

@customElement("learning-root")
export class LearningRoot extends LitElement {
  private _routes = new Routes(
    this,
    [
      {
        path: pathInFeature(paths.learning.dashboard),
        enter: async () => {
          await import("./page/dashboard-page");
          return authService.requireAuth();
        },
        render: () => html`
          <learning-dashboard-page></learning-dashboard-page>
        `,
      },
    ],
    {
      fallback: {
        render: () => nothing,
      },
    }
  );

  render() {
    return html`
      ${this._routes.outlet()}
    `;
  }
}
