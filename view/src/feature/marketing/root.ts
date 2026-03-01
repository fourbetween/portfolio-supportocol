import { Routes } from "@lit-labs/router";
import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { pathInFeature, paths } from "../../app/paths";

@customElement("marketing-root")
export class MarketingRoot extends LitElement {
  private _routes = new Routes(
    this,
    [
      {
        path: pathInFeature(paths.marketing.home),
        enter: async () => {
          await import("./page/home-page");
          return true;
        },
        render: () => html`
          <marketing-home-page></marketing-home-page>
        `,
      },
      {
        path: pathInFeature(paths.marketing.howToUse),
        enter: async () => {
          await import("./page/how-to-use-page");
          return true;
        },
        render: () => html`
          <marketing-how-to-use-page></marketing-how-to-use-page>
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
