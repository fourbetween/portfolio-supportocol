import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("ui-icon-north")
export class IconNorth extends LitElement {
  @property({ type: Number })
  size = 18;

  render() {
    return html`<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="${this.size}" viewBox="0 -960 960 960" width="${this.size}"><path d="M440-80v-647L256-544l-56-56 280-280 280 280-56 57-184-184v647h-80Z"/></svg>`;
  }

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `;
}
