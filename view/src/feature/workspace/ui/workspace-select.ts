import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { inputStyle } from "../../../shared/style/input";
import { WorkspaceWorkspaceSelectEvent } from "../event/workspace";
import type { WorkspaceWithMember } from "../model/workspace";

@customElement("workspace-workspace-select")
export class WorkspaceWorkspaceSelect extends LitElement {
  @property({ type: Array })
  workspaces: WorkspaceWithMember[] = [];

  @property({ type: String })
  selectedWorkspaceId?: string;

  private onChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const workspace = this.workspaces.find(
      (w) => w.workspace.id === select.value,
    );
    this.dispatchEvent(new WorkspaceWorkspaceSelectEvent(workspace));
  }

  render() {
    return html`
      <select .value=${this.selectedWorkspaceId ?? ""} @change=${this.onChange}>
        ${this.workspaces.map(
          (w) => html`
            <option
              value=${w.workspace.id}
              ?selected=${this.selectedWorkspaceId === w.workspace.id}
            >
              ${w.workspace.name}
            </option>
          `,
        )}
      </select>
    `;
  }

  static styles = [
    baseStyle,
    inputStyle,
    css`
      select {
        width: 100%;
      }
    `,
  ];
}
