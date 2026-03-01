import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";

@customElement("marketing-feature-card")
export class MarketingFeatureCard extends LitElement {
  @property()
  href?: string;

  @property()
  title = "";

  @property()
  description = "";

  @property({ type: Boolean })
  showIcon = true;

  render() {
    const cardContent = html`
      <slot name="icon"></slot>
      <h3>${this.title}</h3>
      <p>${this.description}</p>
    `;

    if (this.href) {
      return html`
        <a href=${this.href} class="feature feature--link">${cardContent}</a>
      `;
    }

    return html`
      <div class="feature">${cardContent}</div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .feature {
        display: block;
        padding: 24px;
        border-radius: 12px;
        background-color: var(--color-canvas-subtle);
        border: 1px solid var(--color-border-default);
        transition:
          transform 0.2s,
          box-shadow 0.2s;
        text-align: left;
        height: 100%;
        box-sizing: border-box;
      }

      .feature--link {
        text-decoration: none;
        color: inherit;
      }

      .feature--link:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-medium);
      }

      ::slotted([slot="icon"]) {
        color: var(--color-accent-fg);
        margin-bottom: 16px;
        display: block;
      }

      h3 {
        font-size: 24px;
        margin: 0 0 12px 0;
        color: var(--color-fg-default);
      }

      p {
        font-size: 16px;
        color: var(--color-fg-muted);
        margin: 0;
        line-height: 1.6;
      }
    `,
  ];
}
