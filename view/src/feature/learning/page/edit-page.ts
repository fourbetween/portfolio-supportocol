import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";

@customElement("learning-edit-page")
export class LearningEditPage extends LitElement {
  @property({ type: String })
  discussionId!: string;

  render() {
    return html`
      <div>edit</div>
    `;
  }

  static styles = [baseStyle, buttonStyle, css``];
}
