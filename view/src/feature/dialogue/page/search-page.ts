import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { routerContext } from "../../../app/context/router";
import { buildPath, navigate, paths } from "../../../app/paths";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";

@customElement("dialogue-search-page")
export class DialogueSearchPage extends LitElement {
  @consume({ context: routerContext, subscribe: true })
  private router!: Router;

  render() {
    return html`
      <div>search page</div>
      <div>
        <a href=${buildPath(paths.marketing.home)}>to home page</a>
        <a href=${buildPath(paths.learning.dashboard)}>to learning page</a>
        <a href=${buildPath(paths.dialogue.item, { id: "example-id" })}>
          to item page
        </a>
        <button
          @click=${() =>
            navigate(this.router, paths.dialogue.item, { id: "example-id" })}
        >
          to item page
        </button>
      </div>
    `;
  }

  static styles = [baseStyle, buttonStyle, css``];
}
