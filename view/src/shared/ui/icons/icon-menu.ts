import { customElement } from "lit/decorators.js";
import { IconBase, svg } from "./icon-base.js";

@customElement("ui-icon-menu")
export class IconMenu extends IconBase {
  protected icon() {
    return svg`<path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>`;
  }
}
