import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../style/base";

@customElement("ui-loading")
export class Loading extends LitElement {
  @property({ type: Boolean })
  show = false;

  @property({ type: Number })
  progress?: number;

  render() {
    if (!this.show) return html``;

    return html`
      <div class="overlay" role="status">
        ${this.progress !== undefined
          ? html`
              <div class="progress-container">
                <div
                  class="progress-bar"
                  role="progressbar"
                  aria-valuenow="${this.progress}"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style="width: ${this.progress}%"
                ></div>
                <span class="progress-text">${this.progress}%</span>
              </div>
            `
          : html`
              <div class="spinner" data-testid="spinner"></div>
            `}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--color-canvas-subtle);
        border-top: 4px solid var(--color-accent-fg);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .progress-container {
        width: 80%;
        max-width: 400px;
        background-color: var(--color-canvas-subtle);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
        height: 24px;
        border: 1px solid var(--color-border-default);
      }

      .progress-bar {
        height: 100%;
        background-color: var(--color-accent-fg);
        transition: width 0.3s ease;
      }

      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--color-fg-default);
        font-size: 12px;
        font-weight: bold;
        text-shadow: 0 0 2px var(--color-canvas-default);
      }
    `,
  ];
}
