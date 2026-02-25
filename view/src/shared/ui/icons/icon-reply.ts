import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("ui-icon-reply")
export class IconReply extends LitElement {
  @property({ type: Number })
  size = 18;

  render() {
    return html`<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="${this.size}" viewBox="0 -960 960 960" width="${this.size}"><path d="M760-200v-160q0-50-35-85t-85-35H273l144 144-57 56-240-240 240-240 57 56-144 144h367q83 0 141.5 58.5T840-360v160h-80Z"/></svg>`;
  }

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `;
}
