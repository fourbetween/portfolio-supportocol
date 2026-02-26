import { msg } from "@lit/localize";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { pageStyle } from "../../../shared/style/page";
import "../component/projects-widget";

@customElement("workspace-projects-page")
export class WorkspaceProjectsPage extends LitElement {
  render() {
    return html`
      <main class="container">
        <header class="header">
          <h1>${msg("Projects")}</h1>
          <p class="description">${msg("Manage your projects.")}</p>
        </header>
        <section class="content">
          <workspace-projects-widget></workspace-projects-widget>
        </section>
      </main>
    `;
  }

  static styles = [baseStyle, pageStyle];
}
