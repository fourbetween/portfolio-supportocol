import { customElement } from "lit/decorators.js";
import { IconBase, svg } from "./icon-base.js";

@customElement("ui-icon-chevron-left")
export class IconChevronLeft extends IconBase {
  protected icon() {
    return svg`<path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>`;
  }
}
