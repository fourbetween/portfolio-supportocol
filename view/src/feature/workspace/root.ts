import { Routes } from "@lit-labs/router";
import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { pathInFeature, paths } from "../../app/paths";
import { authService } from "../identity/model/auth-service";

@customElement("workspace-root")
export class WorkspaceRoot extends LitElement {
  private _routes = new Routes(
    this,
    [
      {
        path: pathInFeature(paths.workspace.projects),
        enter: async () => {
          await import("./page/workspace-projects-page");
          return authService.requireAuth();
        },
        render: () => html`
          <workspace-projects-page></workspace-projects-page>
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
