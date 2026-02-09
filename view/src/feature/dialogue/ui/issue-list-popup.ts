import { msg } from "@lit/localize";
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import "../../../shared/ui/popup/popup";
import type { CommentIssue } from "../model/comment";
import "./issue-list";

@customElement("dialogue-issue-list-popup")
export class DialogueIssueListPopup extends LitElement {
  @property({ type: Boolean })
  open = false;

  @property({ type: Array })
  issues: CommentIssue[] = [];

  render() {
    return html`
      <ui-popup .open=${this.open}>
        <div slot="header">${msg("Issues")}</div>
        <div slot="main">
          <dialogue-issue-list .issues=${this.issues}></dialogue-issue-list>
        </div>
      </ui-popup>
    `;
  }

  static styles = [baseStyle];
}
