import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";

@customElement("dialogue-item-page")
export class DialogueItemPage extends LitElement {
  @property({ type: String })
  discussionId!: string;

  render() {
    return html``;
  }

  static styles = [baseStyle, buttonStyle, css``];
}
