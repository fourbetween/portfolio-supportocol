import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "./popup";
import type { Popup } from "./popup";

describe("ui-popup", () => {
  let elem: Popup;

  beforeEach(async () => {
    render(
      html`
        <ui-popup id="test-popup"></ui-popup>
      `,
      document.body
    );
    elem = document.getElementById("test-popup") as Popup;
  });

  afterEach(() => {
    elem?.remove();
  });

  it("footerが空の場合、footerが表示されないこと", async () => {
    await elem.updateComplete;
    const footer = elem.shadowRoot?.querySelector(".footer");
    expect(footer).not.toBeNull();
    const style = window.getComputedStyle(footer!);
    expect(style.display).toBe("none");
  });

  it("footerに内容がある場合、footerが表示されること", async () => {
    render(
      html`
        <ui-popup id="test-popup-with-footer">
          <div slot="footer">Footer Content</div>
        </ui-popup>
      `,
      document.body
    );
    const elemWithFooter = document.getElementById(
      "test-popup-with-footer"
    ) as Popup;
    await elemWithFooter.updateComplete;
    // slotchange might trigger another update
    await new Promise((resolve) => setTimeout(resolve, 0));
    await elemWithFooter.updateComplete;
    const footer = elemWithFooter.shadowRoot?.querySelector(".footer");
    expect(footer).not.toBeNull();
    const style = window.getComputedStyle(footer!);
    expect(style.display).not.toBe("none");
    elemWithFooter.remove();
  });
});
