import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { paths } from "../../../app/paths";
import { baseStyle } from "../../../shared/style/base";
import { pageStyle } from "../../../shared/style/page";
import "../../../shared/ui/icons/icon-arrow-back";
import "../component/project-detail-widget";

@customElement("workspace-project-page")
export class WorkspaceProjectPage extends LitElement {
  @property({ type: String })
  projectId = "";

  render() {
    return html`
      <main class="container">
        <header class="header">
          <a class="back-link" href=${paths.workspace.projects}>
            <ui-icon-arrow-back></ui-icon-arrow-back>
            ${msg("Back to Projects")}
          </a>
        </header>
        <section class="content">
          <workspace-project-detail-widget
            .projectId=${this.projectId}
          ></workspace-project-detail-widget>
        </section>
      </main>
    `;
  }

  static styles = [
    baseStyle,
    pageStyle,
    css`
      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--color-accent-fg);
        text-decoration: none;
        font-size: 14px;
      }

      .back-link:hover {
        text-decoration: underline;
      }
    `,
  ];
}
