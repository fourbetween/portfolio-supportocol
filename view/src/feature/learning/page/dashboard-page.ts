import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import "../component/discussion-list-widget";

@customElement("learning-dashboard-page")
export class LearningDashboardPage extends LitElement {
  render() {
    return html`
      <div class="container">
        <h1>Learning Dashboard</h1>
        <learning-discussion-list-widget></learning-discussion-list-widget>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      .container {
        padding: 24px;
      }
      h1 {
        margin-bottom: 24px;
        font-size: 24px;
        font-weight: 600;
      }
    `,
  ];
}
