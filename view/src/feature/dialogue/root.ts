import { Routes } from "@lit-labs/router";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pathInFeature, paths } from "../../app/paths";

@customElement("dialogue-root")
export class DialogueRoot extends LitElement {
  private _routes = new Routes(this, [
    {
      path: pathInFeature(paths.dialogue.search),
      enter: async () => {
        await import("./page/search-page");
        return true;
      },
      render: () => html`
        <dialogue-search-page></dialogue-search-page>
      `,
    },
    {
      path: pathInFeature(paths.dialogue.item),
      enter: async () => {
        await import("./page/item-page");
        return true;
      },
      render: ({ id }) => html`
        <dialogue-item-page .discussionId=${id as string}></dialogue-item-page>
      `,
    },
  ]);

  render() {
    return html`
      ${this._routes.outlet()}
    `;
  }
}
