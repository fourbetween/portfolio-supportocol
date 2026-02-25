import { customElement } from "lit/decorators.js";
import { IconBase, svg } from "./icon-base.js";

@customElement("ui-icon-expand-more")
export class IconExpandMore extends IconBase {
  protected icon() {
    return svg`<path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"/>`;
  }
}
