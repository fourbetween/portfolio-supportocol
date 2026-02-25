import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("ui-icon-school")
export class IconSchool extends LitElement {
  @property({ type: Number })
  size = 18;

  render() {
    return html`<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="${this.size}" viewBox="0 -960 960 960" width="${this.size}"><path d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 44v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z"/></svg>`;
  }

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `;
}
