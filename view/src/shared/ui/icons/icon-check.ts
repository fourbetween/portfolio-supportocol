import { customElement } from "lit/decorators.js";
import { IconBase, svg } from "./icon-base.js";

@customElement("ui-icon-check")
export class IconCheck extends IconBase {
  protected icon() {
    return svg`<path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>`;
  }
}
