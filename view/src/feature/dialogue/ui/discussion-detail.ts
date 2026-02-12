import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { discussionDetailStyle } from "../../../shared/style/discussion-detail";
import { iconStyle } from "../../../shared/style/icon";
import { titleStyle } from "../../../shared/style/title";
import "../../../shared/ui/discussion-archive-badge/discussion-archive-badge";
import {
  DialogueFavoriteCreateEvent,
  DialogueFavoriteDeleteEvent,
} from "../event/discussion";
import type { Discussion } from "../model/discussion";

@customElement("dialogue-discussion-detail")
export class DialogueDiscussionDetail extends LitElement {
  @property({ type: Object })
  discussion?: Discussion;

  @property({ type: Boolean })
  favorited = false;

  private _handleFavoriteClick() {
    if (!this.discussion) return;
    if (this.favorited) {
      this.dispatchEvent(
        new DialogueFavoriteDeleteEvent(
          this.discussion.workspaceId,
          this.discussion.id,
        ),
      );
    } else {
      this.dispatchEvent(
        new DialogueFavoriteCreateEvent(
          this.discussion.workspaceId,
          this.discussion.id,
        ),
      );
    }
  }

  render() {
    if (!this.discussion) {
      return html``;
    }

    return html`
      <div class="container">
        <div class="badge-row">
          <div class="status-group">
            <ui-discussion-archive-badge
              .archived=${!!this.discussion?.archivedAt}
            ></ui-discussion-archive-badge>
          </div>
          <div class="actions">
            <button
              class="btn"
              @click=${this._handleFavoriteClick}
              aria-label=${this.favorited ? msg("Unfavorite") : msg("Favorite")}
            >
              <span
                class="material-symbols-outlined ${this.favorited
                  ? "fill"
                  : ""}"
              >
                star
              </span>
            </button>
          </div>
        </div>
        <div class="theme-row">
          <div class="section-title">${msg("Theme")}</div>
          <h1 class="theme">${this.discussion?.theme}</h1>
        </div>
        ${this.discussion?.premise
          ? html`
              <div class="premise-row">
                <div class="section-title">${msg("Premise")}</div>
                <p class="premise">${this.discussion.premise}</p>
              </div>
            `
          : html``}
        ${this.discussion?.conclusion
          ? html`
              <div class="conclusion-row">
                <div class="section-title">${msg("Conclusion")}</div>
                <p class="conclusion">${this.discussion.conclusion}</p>
              </div>
            `
          : html``}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
    titleStyle,
    discussionDetailStyle,
    css`
      .status-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .actions {
        display: flex;
        gap: 8px;
      }

      .material-symbols-outlined {
        font-size: 16px;
      }

      .material-symbols-outlined.fill {
        font-variation-settings: "FILL" 1;
        color: var(--color-attention-fg);
      }

      .btn {
        padding: 4px;
        width: 32px;
        height: 32px;
      }
    `,
  ];
}
