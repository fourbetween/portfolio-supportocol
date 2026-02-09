import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { iconStyle } from "../../../shared/style/icon";
import { inputStyle } from "../../../shared/style/input";
import { WorkspaceProjectCreateEvent } from "../event/project";

@customElement("workspace-project-add-form")
export class WorkspaceProjectAddForm extends LitElement {
  @state()
  private name = "";

  private handleSubmit(e: Event) {
    e.preventDefault();
    if (this.name.trim()) {
      this.dispatchEvent(new WorkspaceProjectCreateEvent(this.name.trim()));
      this.name = "";
    }
  }

  render() {
    return html`
      <form @submit=${this.handleSubmit}>
        <input
          type="text"
          placeholder=${msg("New project name")}
          .value=${this.name}
          @input=${(e: InputEvent) =>
            (this.name = (e.target as HTMLInputElement).value)}
        />
        <button
          type="submit"
          class="btn btn-primary"
          ?disabled=${!this.name.trim()}
        >
          <span class="material-symbols-outlined">add</span>
          ${msg("Add Project")}
        </button>
      </form>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
    inputStyle,
    css`
      form {
        display: flex;
        gap: 8px;
      }
      input {
        flex: 1;
      }
    `,
  ];
}
