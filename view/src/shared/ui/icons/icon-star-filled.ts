import { customElement } from "lit/decorators.js";
import { IconBase, svg } from "./icon-base.js";

@customElement("ui-icon-star-filled")
export class IconStarFilled extends IconBase {
  protected icon() {
    return svg`<path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>`;
  }
}
