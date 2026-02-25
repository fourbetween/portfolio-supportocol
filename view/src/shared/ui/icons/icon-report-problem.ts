import { customElement } from "lit/decorators.js";
import { IconBase, svg } from "./icon-base.js";

@customElement("ui-icon-report-problem")
export class IconReportProblem extends IconBase {
  protected icon() {
    return svg`<path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm330.5-51.5Q520-263 520-280t-11.5-28.5Q497-320 480-320t-28.5 11.5Q440-297 440-280t11.5 28.5Q463-240 480-240t28.5-11.5ZM440-360h80v-200h-80v200Zm40-100Z"/>`;
  }
}
