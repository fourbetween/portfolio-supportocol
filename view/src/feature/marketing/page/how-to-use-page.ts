import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { pageStyle } from "../../../shared/style/page";
import "../../../shared/ui/icons/icon-account-tree";
import "../../../shared/ui/icons/icon-add";
import "../../../shared/ui/icons/icon-add-comment";
import "../../../shared/ui/icons/icon-archive";
import "../../../shared/ui/icons/icon-arrow-back";
import "../../../shared/ui/icons/icon-chat";
import "../../../shared/ui/icons/icon-chat-bubble";
import "../../../shared/ui/icons/icon-check";
import "../../../shared/ui/icons/icon-close";
import "../../../shared/ui/icons/icon-delete";
import "../../../shared/ui/icons/icon-drive-file-move";
import "../../../shared/ui/icons/icon-edit";
import "../../../shared/ui/icons/icon-expand-more";
import "../../../shared/ui/icons/icon-folder";
import "../../../shared/ui/icons/icon-forum";
import "../../../shared/ui/icons/icon-login";
import "../../../shared/ui/icons/icon-logout";
import "../../../shared/ui/icons/icon-psychology";
import "../../../shared/ui/icons/icon-public";
import "../../../shared/ui/icons/icon-reply";
import "../../../shared/ui/icons/icon-report";
import "../../../shared/ui/icons/icon-save";
import "../../../shared/ui/icons/icon-school";
import "../../../shared/ui/icons/icon-search";
import "../../../shared/ui/icons/icon-settings";
import "../../../shared/ui/icons/icon-star";
import "../../../shared/ui/icons/icon-unarchive";
import "../ui/feature-card";
import "../ui/feature-list";

@customElement("marketing-how-to-use-page")
export class MarketingHowToUsePage extends LitElement {
  render() {
    return html`
      <main class="container">
        <header class="header">
          <h1>${msg("How to Use")}</h1>
          <p class="description">
            ${msg(
              "Supportocol is a platform that supports systematic discussion. Here is a guide to help you get started.",
            )}
          </p>
        </header>

        <!-- Getting Started -->
        <section class="section">
          <h2>${msg("Getting Started")}</h2>
          <div class="step-list">
            <div class="step">
              <span class="step-number">1</span>
              <div class="step-content">
                <h3>${msg("Join Ongoing Dialogues")}</h3>
                <p>
                  ${msg(
                    "Read public discussions of interest and contribute your opinions.",
                  )}
                </p>
              </div>
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <div class="step-content">
                <h3>${msg("Create Your Own Discussion")}</h3>
                <p>${msg("Organize your thoughts with structured notes.")}</p>
              </div>
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <div class="step-content">
                <h3>${msg("Publish Your Discussion")}</h3>
                <p>
                  ${msg(
                    "By publishing your discussion, you might receive ideas from readers.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Core Concepts -->
        <section class="section">
          <h2>${msg("Core Concepts")}</h2>
          <div class="concept-list">
            <div class="concept-card">
              <div class="concept-header">
                <ui-icon-account-tree .size=${32}></ui-icon-account-tree>
                <h3>${msg("Tree-Structured Comments")}</h3>
              </div>
              <p>
                ${msg(
                  "All comments are organized in a tree structure. Each comment inherits its ancestral comments as premises, which helps focus the reasoning.",
                )}
              </p>
            </div>

            <div class="concept-card">
              <div class="concept-header">
                <ui-icon-chat-bubble .size=${32}></ui-icon-chat-bubble>
                <h3>${msg("Comment Frames")}</h3>
              </div>
              <p>
                ${msg(
                  "A Comment Frame defines available comment types and allowed transition paths. It indicates which type of response can follow a specific comment.",
                )}
              </p>
            </div>

            <div class="concept-card">
              <div class="concept-header">
                <div class="context-icons">
                  <ui-icon-school .size=${24}></ui-icon-school>
                  <ui-icon-forum .size=${24}></ui-icon-forum>
                </div>
                <h3>${msg("Flexibility vs Structure")}</h3>
              </div>
              <p>
                ${msg(
                  "In the Learning context, Comment Frames are dynamic and flexible for personal thought organization. In the Dialogue context, predefined Comment Frames are enforced to ensure systematic discussions.",
                )}
              </p>
            </div>
          </div>
        </section>

        <!-- Features -->
        <section class="section">
          <h2>${msg("Main Features")}</h2>
          <marketing-feature-list></marketing-feature-list>
        </section>

        <!-- Icon Guide -->
        <section class="section">
          <h2>${msg("Icon Guide")}</h2>
          <p class="section-description">
            ${msg(
              "This app uses icon buttons throughout the interface. Here is what each icon means.",
            )}
          </p>

          <h3>${msg("Navigation")}</h3>
          <div class="icon-grid">
            <div class="icon-item">
              <ui-icon-school .size=${24}></ui-icon-school>
              <span>${msg("Learning")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-forum .size=${24}></ui-icon-forum>
              <span>${msg("Dialogue")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-folder .size=${24}></ui-icon-folder>
              <span>${msg("Projects")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-search .size=${24}></ui-icon-search>
              <span>${msg("Search")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-settings .size=${24}></ui-icon-settings>
              <span>${msg("Settings")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-arrow-back .size=${24}></ui-icon-arrow-back>
              <span>${msg("Go Back")}</span>
            </div>
          </div>

          <h3>${msg("Actions")}</h3>
          <div class="icon-grid">
            <div class="icon-item">
              <ui-icon-add .size=${24}></ui-icon-add>
              <span>${msg("Add New")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-add-comment .size=${24}></ui-icon-add-comment>
              <span>${msg("Add Comment")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-reply .size=${24}></ui-icon-reply>
              <span>${msg("Reply")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-edit .size=${24}></ui-icon-edit>
              <span>${msg("Edit")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-save .size=${24}></ui-icon-save>
              <span>${msg("Save")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-delete .size=${24}></ui-icon-delete>
              <span>${msg("Delete")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-check .size=${24}></ui-icon-check>
              <span>${msg("Confirm")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-close .size=${24}></ui-icon-close>
              <span>${msg("Close")}</span>
            </div>
          </div>

          <h3>${msg("Discussion & Comments")}</h3>
          <div class="icon-grid">
            <div class="icon-item">
              <ui-icon-account-tree .size=${24}></ui-icon-account-tree>
              <span>${msg("Tree View")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-chat .size=${24}></ui-icon-chat>
              <span>${msg("Comments")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-psychology .size=${24}></ui-icon-psychology>
              <span>${msg("AI Assist")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-report .size=${24}></ui-icon-report>
              <span>${msg("Issues")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-expand-more .size=${24}></ui-icon-expand-more>
              <span>${msg("Expand")}</span>
            </div>
          </div>

          <h3>${msg("Organization")}</h3>
          <div class="icon-grid">
            <div class="icon-item">
              <ui-icon-archive .size=${24}></ui-icon-archive>
              <span>${msg("Archive")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-unarchive .size=${24}></ui-icon-unarchive>
              <span>${msg("Unarchive")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-star .size=${24}></ui-icon-star>
              <span>${msg("Favorite")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-public .size=${24}></ui-icon-public>
              <span>${msg("Public")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-drive-file-move .size=${24}></ui-icon-drive-file-move>
              <span>${msg("Move")}</span>
            </div>
          </div>

          <h3>${msg("Account")}</h3>
          <div class="icon-grid">
            <div class="icon-item">
              <ui-icon-login .size=${24}></ui-icon-login>
              <span>${msg("Login")}</span>
            </div>
            <div class="icon-item">
              <ui-icon-logout .size=${24}></ui-icon-logout>
              <span>${msg("Logout")}</span>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  static styles = [
    baseStyle,
    pageStyle,
    css`
      .section {
        margin-bottom: 48px;
      }

      .section h2 {
        font-size: 24px;
        font-weight: 600;
        color: var(--color-fg-default);
        margin: 0 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--color-border-default);
      }

      .section-description {
        color: var(--color-fg-muted);
        margin-bottom: 24px;
        line-height: 1.6;
      }

      .section > p {
        color: var(--color-fg-muted);
        line-height: 1.6;
      }

      /* Steps */
      .step-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .step {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }

      .step-number {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: var(--color-accent-fg);
        color: #fff;
        font-weight: 600;
        font-size: 14px;
      }

      .step-content h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-fg-default);
        margin: 4px 0 8px 0;
      }

      .step-content p {
        color: var(--color-fg-muted);
        line-height: 1.6;
      }

      /* Icon Grid */
      h3 {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-fg-default);
        margin: 24px 0 12px 0;
      }

      .icon-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 12px;
      }

      .icon-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 8px;
        background-color: var(--color-canvas-subtle);
        border: 1px solid var(--color-border-default);
        font-size: 14px;
        color: var(--color-fg-default);
      }

      /* Core Concepts */
      .concept-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .concept-card {
        padding: 20px;
        border-radius: 12px;
        background-color: var(--color-canvas-subtle);
        border: 1px solid var(--color-border-default);
      }

      .concept-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .concept-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .concept-card p {
        margin: 0;
        font-size: 14px;
        color: var(--color-fg-muted);
        line-height: 1.6;
      }

      .context-icons {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      @media (max-width: 600px) {
        .icon-grid {
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
      }
    `,
  ];
}
