import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";

@customElement("learning-dashboard-page")
export class LearningDashboardPage extends LitElement {
  render() {
    return html`
      <div>dashboard</div>
    `;
  }

  static styles = [baseStyle, buttonStyle, css``];
}
