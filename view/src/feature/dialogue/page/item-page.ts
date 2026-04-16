import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { msg } from "@lit/localize";
import { Task } from "@lit/task";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { routerContext } from "../../../app/context/router";
import { userContext } from "../../../app/context/user";
import { TitleController } from "../../../app/controller/title";
import { TouchController } from "../../../app/controller/touch";
import type { User } from "../../../app/model/user";
import { navigate, paths } from "../../../app/paths";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { dashboardStyle } from "../../../shared/style/dashboard";
import { hoverButtonStyle } from "../../../shared/style/hover-button";
import { titleStyle } from "../../../shared/style/title";
import "../../../shared/ui/drawer/drawer";
import "../../../shared/ui/icons/icon-menu";
import "../../../shared/ui/icons/icon-star";
import type { FavoriteDiscussionSummary } from "../../workspace/model/favorite-discussion";
import { favoriteDiscussionRepository } from "../../workspace/repository/favorite-discussion-repository";
import "../component/comment-explorer-widget";
import {
  type DialogueCommentCreatedEvent,
  type DialogueCommentSelectEvent,
  type DialogueCommentUpdatedEvent,
} from "../event/comment";
import {
  DialogueDiscussionSelectEvent,
  DialogueFavoriteCreateEvent,
  DialogueFavoriteDeleteEvent,
} from "../event/discussion";
import type { Comment } from "../model/comment";
import type { Discussion } from "../model/discussion";
import { commentRepository } from "../repository/comment-repository";
import { discussionRepository } from "../repository/discussion-repository";
import "../ui/comment-frame-detail";
import "../ui/comment-list";
import "../ui/discussion-detail";
import "../ui/favorite-list";

const LEFT_DRAWER_OPENED_STORAGE_KEY = "dialogue:item-page:left-drawer-opened";
const RIGHT_DRAWER_OPENED_STORAGE_KEY =
  "dialogue:item-page:right-drawer-opened";

type DrawerSide = "left" | "right";

@customElement("dialogue-item-page")
export class DialogueItemPage extends LitElement {
  private _touch = new TouchController(this);
  private _title = new TitleController(this);

  @property({ type: String })
  workspaceId!: string;

  @property({ type: String })
  discussionId!: string;

  @consume({ context: userContext, subscribe: true })
  @state()
  private _user?: User;

  @consume({ context: routerContext, subscribe: true })
  @state()
  private _router?: Router;

  @state()
  private _discussion?: Discussion;

  @state()
  private _comments: Comment[] = [];

  @state()
  private _favorites: FavoriteDiscussionSummary[] = [];

  @state()
  private _selectedCommentId?: string;

  @state()
  private _activeDrawer?: "left" | "right";

  @state()
  private _hasOpenedLeftDrawer = false;

  @state()
  private _hasOpenedRightDrawer = false;

  constructor() {
    super();
    this._hasOpenedLeftDrawer = this._hasOpenedDrawer("left");
    this._hasOpenedRightDrawer = this._hasOpenedDrawer("right");

    new Task(this, {
      task: async ([workspaceId, discussionId]) => {
        return discussionRepository.load(workspaceId, discussionId);
      },
      onComplete: (discussion) => {
        this._discussion = discussion;
        this._title.update(discussion?.theme);
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.workspaceId, this.discussionId],
    });

    new Task(this, {
      task: async ([workspaceId, discussionId]) => {
        if (!workspaceId || !discussionId) return [] as Comment[];
        return commentRepository.list(workspaceId, discussionId);
      },
      onComplete: (comments) => {
        this._comments = comments;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.workspaceId, this.discussionId],
    });

    new Task(this, {
      task: async ([workspaceId, user]) => {
        if (!workspaceId || !user) return [] as FavoriteDiscussionSummary[];
        return favoriteDiscussionRepository.list(workspaceId);
      },
      onComplete: (favorites) => {
        this._favorites = favorites;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.workspaceId, this._user],
    });
  }

  private _getDrawerOpenedStorageKey(side: DrawerSide) {
    return side === "left"
      ? LEFT_DRAWER_OPENED_STORAGE_KEY
      : RIGHT_DRAWER_OPENED_STORAGE_KEY;
  }

  private _hasOpenedDrawer(side: DrawerSide) {
    return (
      localStorage.getItem(this._getDrawerOpenedStorageKey(side)) === "true"
    );
  }

  private _markDrawerOpened(side: DrawerSide) {
    if (side === "left") {
      if (this._hasOpenedLeftDrawer) return;
      this._hasOpenedLeftDrawer = true;
    } else {
      if (this._hasOpenedRightDrawer) return;
      this._hasOpenedRightDrawer = true;
    }

    localStorage.setItem(this._getDrawerOpenedStorageKey(side), "true");
  }

  private _openDrawer(side: DrawerSide) {
    this._markDrawerOpened(side);
    this._activeDrawer = side;
  }

  private _getDrawerButtonClass(side: DrawerSide, shouldAttention: boolean) {
    return `btn-hover btn-${side}${shouldAttention ? " attention" : ""}`;
  }

  private get _shouldHighlightLeftDrawerButton() {
    return (
      this._favorites.length > 0 &&
      !this._hasOpenedLeftDrawer &&
      this._activeDrawer !== "left"
    );
  }

  private get _shouldHighlightRightDrawerButton() {
    return !this._hasOpenedRightDrawer && this._activeDrawer !== "right";
  }

  private _handleCommentSelect(e: DialogueCommentSelectEvent) {
    this._selectedCommentId = e.commentId;
  }

  private _handleCommentCreated(e: DialogueCommentCreatedEvent) {
    this._comments = [...this._comments, e.comment];
  }

  private _handleCommentUpdated(e: DialogueCommentUpdatedEvent) {
    this._comments = this._comments.map((c) =>
      c.id === e.comment.id ? e.comment : c,
    );
  }

  private _handleFavoriteSelect(e: DialogueDiscussionSelectEvent) {
    if (!this._router) return;
    navigate(this._router, paths.dialogue.item, {
      workspaceId: e.workspaceId,
      discussionId: e.discussionId,
    });
  }

  private async _handleFavoriteCreate(e: DialogueFavoriteCreateEvent) {
    try {
      await favoriteDiscussionRepository.favorite(
        e.workspaceId,
        e.discussionId,
      );
      this._favorites = await favoriteDiscussionRepository.list(e.workspaceId);
      showToast(this, msg("Added to favorites."), "success", 2000);
    } catch (error) {
      showToast(this, String(error), "error");
    }
  }

  private async _handleFavoriteDelete(e: DialogueFavoriteDeleteEvent) {
    try {
      await favoriteDiscussionRepository.unfavorite(
        e.workspaceId,
        e.discussionId,
      );
      this._favorites = this._favorites.filter((f) => f.id !== e.discussionId);
      showToast(this, msg("Removed from favorites."), "success", 2000);
    } catch (error) {
      showToast(this, String(error), "error");
    }
  }

  private _renderLeftSidebar(isTouch: boolean) {
    if (!this._user || this._favorites.length === 0) return nothing;

    const list = html`
      <dialogue-favorite-list
        .favorites=${this._favorites}
        .selectedDiscussionId=${this.discussionId}
        @dialogue-discussion-select=${this._handleFavoriteSelect}
      ></dialogue-favorite-list>
    `;

    if (isTouch) {
      return html`
        <ui-drawer
          placement="left"
          .open=${this._activeDrawer === "left"}
          @drawer-close=${() => (this._activeDrawer = undefined)}
        >
          <span slot="header">${msg("Favorites")}</span>
          <section>${list}</section>
        </ui-drawer>
      `;
    }

    return html`
      <aside class="sidebar sidebar-left">
        <section>
          <div class="section-title">${msg("Favorites")}</div>
          ${list}
        </section>
      </aside>
    `;
  }

  private _renderRightSidebar(isTouch: boolean) {
    const list = html`
      <dialogue-comment-list
        .comments=${this._comments}
        @dialogue-comment-select=${this._handleCommentSelect}
      ></dialogue-comment-list>
    `;

    if (isTouch) {
      return html`
        <ui-drawer
          placement="right"
          .open=${this._activeDrawer === "right"}
          @drawer-close=${() => (this._activeDrawer = undefined)}
        >
          <span slot="header">${msg("Latest first")}</span>
          <section>${list}</section>
        </ui-drawer>
      `;
    }

    return html`
      <aside class="sidebar sidebar-right">
        <section>
          <div class="section-title">${msg("Latest first")}</div>
          ${list}
        </section>
      </aside>
    `;
  }

  private _renderMainContent() {
    const isFavorited = this._favorites.some((f) => f.id === this.discussionId);
    return html`
      <main class="main">
        <div class="detail">
          <dialogue-discussion-detail
            .discussion=${this._discussion}
            .favorited=${isFavorited}
            .isAuthenticated=${!!this._user}
            @dialogue-favorite-create=${this._handleFavoriteCreate}
            @dialogue-favorite-delete=${this._handleFavoriteDelete}
          ></dialogue-discussion-detail>
        </div>
        <div class="comment-frame">
          <dialogue-comment-frame-detail
            .frame=${this._discussion?.dialogueSettings.commentFrame}
            .comments=${this._comments}
          ></dialogue-comment-frame-detail>
        </div>
        <div class="comment-explorer">
          <dialogue-comment-explorer-widget
            .discussion=${this._discussion}
            .comments=${this._comments}
            .selectedCommentId=${this._selectedCommentId}
            .readonly=${!!this._discussion?.archivedAt}
            .isAuthenticated=${!!this._user}
            @dialogue-comment-select=${this._handleCommentSelect}
            @dialogue-comment-created=${this._handleCommentCreated}
            @dialogue-comment-updated=${this._handleCommentUpdated}
          ></dialogue-comment-explorer-widget>
        </div>
      </main>
    `;
  }

  private _renderFABs() {
    if (!this._touch.isTouchDevice) return nothing;

    return html`
      ${this._user && this._favorites.length > 0
        ? html`
            <button
              class=${this._getDrawerButtonClass(
                "left",
                this._shouldHighlightLeftDrawerButton,
              )}
              @click=${() => this._openDrawer("left")}
            >
              <ui-icon-star></ui-icon-star>
            </button>
          `
        : nothing}
      <button
        class=${this._getDrawerButtonClass(
          "right",
          this._shouldHighlightRightDrawerButton,
        )}
        @click=${() => this._openDrawer("right")}
      >
        <ui-icon-menu></ui-icon-menu>
      </button>
    `;
  }

  render() {
    if (!this._discussion) return nothing;

    const isTouch = this._touch.isTouchDevice;

    return html`
      <div class="dashboard hover-container">
        ${this._renderLeftSidebar(isTouch)} ${this._renderMainContent()}
        ${this._renderRightSidebar(isTouch)} ${this._renderFABs()}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    titleStyle,
    buttonStyle,
    hoverButtonStyle,
    dashboardStyle,
    css`
      section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        border-radius: 6px;
      }
    `,
  ];
}
