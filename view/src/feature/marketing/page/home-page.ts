import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { iconStyle } from "../../../shared/style/icon";

@customElement("marketing-home-page")
export class MarketingHomePage extends LitElement {
  render() {
    return html`
      <main class="container container--narrow hero">
        <h1>Supportocol</h1>
        <p class="description">${msg("A platform for logical discussion")}</p>

        <section class="features">
          <div class="feature">
            <span class="material-symbols-outlined feature-icon">school</span>
            <h3>${msg("Learning")}</h3>
            <p>
              ${msg(
                "Organize your thoughts and refine your logic through structured note-taking.",
              )}
            </p>
          </div>
          <div class="feature">
            <span class="material-symbols-outlined feature-icon">forum</span>
            <h3>${msg("Dialogue")}</h3>
            <p>
              ${msg(
                "Engage in constructive and logical discussions with others using defined frameworks.",
              )}
            </p>
          </div>
          <div class="feature">
            <span class="material-symbols-outlined feature-icon">folder</span>
            <h3>${msg("Projects")}</h3>
            <p>
              ${msg(
                "Manage your discussions and collaborate efficiently within your workspace.",
              )}
            </p>
          </div>
        </section>
      </main>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
    css`
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
      }

      .container--narrow {
        max-width: 800px;
      }

      .hero {
        padding: 80px 0px;
        text-align: center;
      }

      h1 {
        font-size: 48px;
        font-weight: 700;
        color: var(--color-fg-default);
        margin: 0 0 16px 0;
      }

      .description {
        font-size: 20px;
        color: var(--color-fg-muted);
        margin: 0 0 60px 0;
        line-height: 1.5;
      }

      .features {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
        margin-top: 40px;
        padding: 0 48px;
        text-align: left;
      }

      .feature {
        padding: 24px;
        border-radius: 12px;
        background-color: var(--color-canvas-subtle);
        border: 1px solid var(--color-border-default);
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }

      .feature:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-medium);
      }

      .feature-icon {
        font-size: 40px;
        color: var(--color-accent-fg);
        margin-bottom: 16px;
        display: block;
      }

      .feature h3 {
        font-size: 24px;
        margin: 0 0 12px 0;
        color: var(--color-fg-default);
      }

      .feature p {
        font-size: 16px;
        color: var(--color-fg-muted);
        margin: 0;
        line-height: 1.6;
      }

      .actions {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }

      .btn-large {
        padding: 12px 24px;
        font-size: 16px;
      }

      .link {
        font-size: 16px;
        color: var(--color-accent-fg);
        text-decoration: none;
      }

      .link:hover {
        text-decoration: underline;
      }
    `,
  ];
}
