import { type Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { msg } from "@lit/localize";
import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { routerContext } from "../../../app/context/router";
import { navigate, paths } from "../../../app/paths";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import "../../../shared/ui/icons/icon-folder";
import "../../../shared/ui/icons/icon-forum";
import "../../../shared/ui/icons/icon-school";
import "../../../shared/ui/icons/icon-search";
import { DialogueDiscussionSelectEvent } from "../../dialogue/event/discussion";
import type { DiscussionSummary } from "../../dialogue/model/discussion";
import { discussionRepository } from "../../dialogue/repository/discussion-repository";
import "../../dialogue/ui/discussion-list";

const HOME_PAGE_SIZE = 10;

@customElement("marketing-home-page")
export class MarketingHomePage extends LitElement {
  @consume({ context: routerContext, subscribe: true })
  @state()
  private _router?: Router;

  @state()
  private _popularDiscussions: DiscussionSummary[] = [];

  constructor() {
    super();

    new Task(this, {
      task: async () => {
        return discussionRepository.list("favoritesCount", 1, HOME_PAGE_SIZE);
      },
      onComplete: (result) => {
        this._popularDiscussions = result.items;
      },
      onError: (e: unknown) => {
        console.error(e);
      },
      args: () => [],
    });
  }

  private _handleDiscussionSelect(e: DialogueDiscussionSelectEvent) {
    if (!this._router) return;
    navigate(this._router, paths.dialogue.item, {
      workspaceId: e.workspaceId,
      discussionId: e.discussionId,
    });
  }

  render() {
    return html`
      <main class="container container--narrow hero">
        <h1>Supportocol</h1>
        <p class="description">${msg("A platform for logical discussion")}</p>

        <div class="actions">
          <a href=${paths.dialogue.search} class="btn btn-primary btn-large">
            <ui-icon-search></ui-icon-search>
            ${msg("Public Discussions")}
          </a>
        </div>

        <section class="popular">
          <h2>${msg("Popular Discussions")}</h2>
          <dialogue-discussion-list
            .summaries=${this._popularDiscussions}
            @dialogue-discussion-select=${this._handleDiscussionSelect}
          ></dialogue-discussion-list>
        </section>

        <section class="features">
          <a href=${paths.learning.dashboard} class="feature">
            <ui-icon-school class="feature-icon" .size=${40}></ui-icon-school>
            <h3>${msg("Learning")}</h3>
            <p>
              ${msg("Organize your thoughts through structured note-taking.")}
            </p>
          </a>
          <a href=${paths.dialogue.search} class="feature">
            <ui-icon-forum class="feature-icon" .size=${40}></ui-icon-forum>
            <h3>${msg("Dialogue")}</h3>
            <p>
              ${msg(
                "Engage in logical discussions with everyone using your own defined frameworks.",
              )}
            </p>
          </a>
          <a href=${paths.workspace.projects} class="feature">
            <ui-icon-folder class="feature-icon" .size=${40}></ui-icon-folder>
            <h3>${msg("Projects")}</h3>
            <p>${msg("Organize your discussions into projects.")}</p>
          </a>
        </section>
      </main>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
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

      .popular {
        margin-top: 60px;
        padding: 0 48px;
        text-align: left;
      }

      .popular h2 {
        font-size: 24px;
        margin-bottom: 24px;
        color: var(--color-fg-default);
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
        display: block;
        text-decoration: none;
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
