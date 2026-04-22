import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { discussionDetailStyle } from "../../../shared/style/discussion-detail";
import { titleStyle } from "../../../shared/style/title";
import "../../../shared/ui/collapsible-section/collapsible-section";
import "../../../shared/ui/discussion-archive-badge/discussion-archive-badge";
import "../../../shared/ui/icons/icon-star";
import "../../../shared/ui/icons/icon-star-filled";
import "../../../shared/ui/markdown-viewer/markdown-viewer";
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

  @property({ type: Boolean })
  isAuthenticated = false;

  @state()
  private _isFavoriteCooldown = false;

  private _handleFavoriteClick() {
    if (!this.discussion || this._isFavoriteCooldown) return;

    this._isFavoriteCooldown = true;
    setTimeout(() => {
      this._isFavoriteCooldown = false;
    }, 3000);

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
            ${this.isAuthenticated
              ? html`
                  <button
                    class="btn"
                    ?disabled=${this._isFavoriteCooldown}
                    @click=${this._handleFavoriteClick}
                    aria-label=${this.favorited
                      ? msg("Unfavorite")
                      : msg("Favorite")}
                  >
                    ${this.favorited
                      ? html`
                          <ui-icon-star-filled
                            .size=${16}
                            class="fill"
                          ></ui-icon-star-filled>
                        `
                      : html`
                          <ui-icon-star .size=${16}></ui-icon-star>
                        `}
                  </button>
                `
              : html``}
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
                <ui-collapsible-section>
                  <ui-markdown-viewer
                    .content=${this.discussion.premise}
                  ></ui-markdown-viewer>
                </ui-collapsible-section>
              </div>
            `
          : html``}
        ${this.discussion?.conclusion
          ? html`
              <div class="conclusion-row">
                <div class="section-title">${msg("Conclusion")}</div>
                <ui-collapsible-section>
                  <ui-markdown-viewer
                    .content=${this.discussion.conclusion}
                  ></ui-markdown-viewer>
                </ui-collapsible-section>
              </div>
            `
          : html``}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
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

      .fill {
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
