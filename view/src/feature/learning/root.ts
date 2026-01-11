import { Routes } from "@lit-labs/router";
import { provide } from "@lit/context";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { userContext } from "../../app/context/user";
import { pathInFeature, paths } from "../../app/paths";
import { authService } from "../identity/model/auth";
import type { User } from "../identity/model/user";

@customElement("learning-root")
export class LearningRoot extends LitElement {
  private _routes = new Routes(this, [
    {
      path: pathInFeature(paths.learning.dashboard),
      enter: async () => {
        await import("./page/dashboard-page");
        return this.requireAuth();
      },
      render: () => html`
        <learning-dashboard-page></learning-dashboard-page>
      `,
    },
  ]);

  @provide({ context: userContext })
  @state()
  private user: User | null = null;

  private async requireAuth() {
    if (this.user) {
      return true;
    }
    this.user = await authService.getCurrentUser();
    return true;
  }

  render() {
    return html`
      ${this._routes.outlet()}
    `;
  }
}
