import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { paths } from "../../../app/paths";
import { baseStyle } from "../../../shared/style/base";
import "../../../shared/ui/icons/icon-folder";
import "../../../shared/ui/icons/icon-forum";
import "../../../shared/ui/icons/icon-school";
import "./feature-card";

@customElement("marketing-feature-list")
export class MarketingFeatureList extends LitElement {
  render() {
    return html`
      <div class="features">
        <marketing-feature-card
          .title=${msg("Dialogue")}
          .description=${msg(
            "A feature for discussing with everyone. It promotes logical discussion by following comment frames.",
          )}
          .href=${paths.dialogue.search}
        >
          <ui-icon-forum slot="icon" .size=${32}></ui-icon-forum>
        </marketing-feature-card>
        <marketing-feature-card
          .title=${msg("Learning")}
          .description=${msg(
            "A feature for organizing your thoughts. It helps you find which structure is suitable for the discussion topic.",
          )}
          .href=${paths.learning.dashboard}
        >
          <ui-icon-school slot="icon" .size=${32}></ui-icon-school>
        </marketing-feature-card>
        <marketing-feature-card
          .title=${msg("Projects")}
          .description=${msg(
            "Organize discussions by project. You can easily move discussions between projects.",
          )}
          .href=${paths.workspace.projects}
        >
          <ui-icon-folder slot="icon" .size=${32}></ui-icon-folder>
        </marketing-feature-card>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .features {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
    `,
  ];
}
