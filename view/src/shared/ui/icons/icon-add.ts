import { customElement } from "lit/decorators.js";
import { IconBase, svg } from "./icon-base.js";

@customElement("ui-icon-add")
export class IconAdd extends IconBase {
  protected icon() {
    return svg`<path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>`;
  }
}
