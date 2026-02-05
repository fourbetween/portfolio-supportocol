import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { listStyles } from "../../../../shared/style/list";
import { DialogueDiscussionSelectEvent } from "../../event/discussion";
import type { DiscussionSummary } from "../../model/discussion";

@customElement("dialogue-discussion-item")
export class DialogueDiscussionItem extends LitElement {
  @property({ type: Object })
  summary!: DiscussionSummary;

  private handleClick() {
    this.dispatchEvent(
      new DialogueDiscussionSelectEvent(
        this.summary.workspaceId,
        this.summary.id,
      ),
    );
  }

  render() {
    return html`
      <div class="item hover-container" @click=${this.handleClick}>
        <span class="theme">${this.summary.theme}</span>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    listStyles,
    css`
      .theme {
        font-size: 0.9rem;
        color: var(--color-accent-fg);
      }
    `,
  ];
}
