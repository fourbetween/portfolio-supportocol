import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
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

  static styles = [
    baseStyle,
    css`
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 32px 24px;
      }

      .header {
        margin-bottom: 24px;
      }

      h1 {
        font-size: 28px;
        font-weight: 600;
        color: var(--color-fg-default);
        margin: 0 0 8px 0;
      }

      .description {
        font-size: 16px;
        color: var(--color-fg-muted);
        line-height: 1.5;
      }

      .content {
        margin-top: 16px;
      }
    `,
  ];
}
