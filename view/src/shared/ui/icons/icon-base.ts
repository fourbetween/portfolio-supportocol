import { LitElement, css, html, svg, type SVGTemplateResult } from "lit";
import { property } from "lit/decorators.js";

export abstract class IconBase extends LitElement {
  @property({ type: Number })
  size = 18;

  protected abstract icon(): SVGTemplateResult;

  render() {
    return html`
      <svg
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        height="${this.size}"
        viewBox="0 -960 960 960"
        width="${this.size}"
      >
        ${this.icon()}
      </svg>
    `;
  }

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: inherit;
    }
    svg {
      fill: currentColor;
    }
  `;
}

export { svg };
