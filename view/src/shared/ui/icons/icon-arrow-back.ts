import { customElement } from "lit/decorators.js";
import { IconBase, svg } from "./icon-base.js";

@customElement("ui-icon-arrow-back")
export class IconArrowBack extends IconBase {
  protected icon() {
    return svg`<path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/>`;
  }
}
