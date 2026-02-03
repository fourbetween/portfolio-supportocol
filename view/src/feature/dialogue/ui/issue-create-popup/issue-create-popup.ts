import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import { titleStyle } from "../../../../shared/style/title";
import "../../../../shared/ui/popup/popup";
import type { Comment } from "../../model/comment";
import type { CommentFrame } from "../../model/comment-frame";
import "../comment-context/comment-context";
import "../issue-form/issue-form";

@customElement("dialogue-issue-create-popup")
export class DialogueIssueCreatePopup extends LitElement {
  @property({ type: Boolean })
  open = false;

  @property({ type: Array })
  path: Comment[] = [];

  @property({ type: Object })
  frame?: CommentFrame;

  render() {
    return html`
      <ui-popup .open=${this.open}>
        <div slot="header">Add Issue</div>
        <div slot="main">
          <div class="container">
            ${this.renderContextSection()}
            <div class="section">
              <div class="section-title">Issue Details</div>
              <dialogue-issue-form></dialogue-issue-form>
            </div>
          </div>
        </div>
      </ui-popup>
    `;
  }

  private renderContextSection() {
    if (this.path.length === 0) return nothing;

    return html`
      <div class="section">
        <div class="section-title">Target Comment Context</div>
        <dialogue-comment-context
          .path=${this.path}
          .frame=${this.frame}
          .readonly=${true}
        ></dialogue-comment-context>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    titleStyle,
    css`
      :host {
        display: block;
      }
      .container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        min-width: 400px;
        max-width: 600px;
      }
      .section-title {
        font-size: 1.1rem;
        margin-bottom: 12px;
        color: var(--color-text-primary);
      }
    `,
  ];
}
