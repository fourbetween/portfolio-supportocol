import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { inputStyle } from "../../../../shared/style/input";
import { WorkspaceWorkspaceSelectEvent } from "../../event/workspace";
import type { WorkspaceWithMember } from "../../model/workspace";

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
        padding: 5px 12px;
        font-size: 14px;
        line-height: 20px;
        color: var(--color-fg-default);
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        outline: none;
        width: 100%;
      }

      select:focus {
        border-color: var(--color-accent-fg);
        box-shadow: inset 0 0 0 1px var(--color-accent-fg);
      }
    `,
  ];
}
