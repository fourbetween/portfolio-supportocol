import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";

@customElement("dashboard-page-container")
export class DashboardPageContainer extends LitElement {
  @property({ type: Boolean })
  isLoggedIn = false;

  render() {
    return html`
      <div class="container">
        <div class="side">
          <project-list-presenter .projects=${[]}></project-list-presenter>
        </div>
        <div class="main">
          <discussion-list-presenter
            .discussions=${[]}
          ></discussion-list-presenter>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .container {
        display: flex;
        height: 100%;
        gap: 16px;
      }

      .side {
        width: 300px;
      }

      .main {
        flex: 1;
      }
    `,
  ];
}
