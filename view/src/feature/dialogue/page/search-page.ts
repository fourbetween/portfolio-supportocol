import { msg } from "@lit/localize";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { pageStyle } from "../../../shared/style/page";
import "../component/discussion-list-widget";

@customElement("dialogue-search-page")
export class DialogueSearchPage extends LitElement {
  render() {
    return html`
      <main class="container">
        <header class="header">
          <h1>${msg("Public Discussions")}</h1>
          <p class="description">${msg("Explore and join discussions.")}</p>
        </header>
        <section class="content">
          <dialogue-discussion-list-widget
            .pageSize=${50}
          ></dialogue-discussion-list-widget>
        </section>
      </main>
    `;
  }

  static styles = [baseStyle, pageStyle];
}
