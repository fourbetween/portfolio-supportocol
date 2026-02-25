import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("ui-icon-add")
export class IconAdd extends LitElement {
  @property({ type: Number })
  size = 18;

  render() {
    return html`<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="${this.size}" viewBox="0 -960 960 960" width="${this.size}"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>`;
  }

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `;
}
