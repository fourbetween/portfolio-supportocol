import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { baseStyle } from "../../../shared/style/base";
import { hoverButtonStyle } from "../../../shared/style/hover-button";
import { iconStyle } from "../../../shared/style/icon";
import { listStyles } from "../../../shared/style/list";
import {
  DialogueDiscussionSelectEvent,
  DialogueFavoriteDeleteEvent,
} from "../event/discussion";

export interface FavoriteItem {
  id: string;
  workspaceId: string;
  theme: string;
  commentsCount: number;
  favoritesCount: number;
}

@customElement("dialogue-favorite-list")
export class DialogueFavoriteList extends LitElement {
  @property({ type: Array })
  favorites: FavoriteItem[] = [];

  @property({ type: String })
  selectedDiscussionId?: string;

  private handleDelete(e: Event, workspaceId: string, discussionId: string) {
    e.stopPropagation();
    this.dispatchEvent(
      new DialogueFavoriteDeleteEvent(workspaceId, discussionId),
    );
  }

  render() {
    if (this.favorites.length === 0) {
      return html`
        <div class="empty">${msg("No favorites yet.")}</div>
      `;
    }
    return html`
      <div class="list">
        ${repeat(
          this.favorites,
          (f) => f.id,
          (f) => html`
            <div
              class="item hover-container ${f.id === this.selectedDiscussionId
                ? "selected"
                : ""}"
              @click=${() =>
                this.dispatchEvent(
                  new DialogueDiscussionSelectEvent(f.workspaceId, f.id),
                )}
            >
              <div class="info">
                <span class="theme">${f.theme}</span>
                <div class="stats">
                  <div class="stat-item" title=${msg("Comments")}>
                    <span class="material-symbols-outlined">chat</span>
                    <span class="count">${f.commentsCount}</span>
                  </div>
                  <div class="stat-item" title=${msg("Favorites")}>
                    <span class="material-symbols-outlined">star</span>
                    <span class="count">${f.favoritesCount}</span>
                  </div>
                </div>
              </div>
              <button
                class="btn-hover danger delete-button"
                aria-label=${msg("delete")}
                @click=${(e: Event) =>
                  this.handleDelete(e, f.workspaceId, f.id)}
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          `,
        )}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    hoverButtonStyle,
    listStyles,
    css`
      .empty {
        padding: 16px;
        color: var(--color-fg-muted);
        font-size: 0.85rem;
      }
      .list {
        display: flex;
        flex-direction: column;
      }
      .info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        flex: 1;
      }
      .theme {
        font-size: 0.9rem;
        color: var(--color-accent-fg);
      }
      .selected {
        background-color: var(--color-canvas-subtle);
      }
      .stats {
        display: flex;
        gap: 12px;
        color: var(--color-fg-muted);
      }
      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .stat-item .material-symbols-outlined {
        font-size: 16px;
      }
      .count {
        font-size: 0.8rem;
      }
      .delete-button {
        right: 0;
        top: 50%;
        transform: translate(50%, -50%);
      }
    `,
  ];
}
