import { customElement } from "lit/decorators.js";
import { IconBase, svg } from "./icon-base.js";

@customElement("ui-icon-chevron-right")
export class IconChevronRight extends IconBase {
  protected icon() {
    return svg`<path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>`;
  }
}
