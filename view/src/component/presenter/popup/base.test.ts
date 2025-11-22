import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "./base";
import type { BasePopupPresenter } from "./base";

describe("BasePopupPresenter", async () => {
  let elem: BasePopupPresenter;

  beforeEach(() => {
    elem = document.createElement("base-popup-presenter") as BasePopupPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("open()メソッドを呼ぶとダイアログが表示されること", async () => {
    elem.open();
    await elem.updateComplete;
    const dialog = elem.shadowRoot?.querySelector("dialog");
    expect(dialog?.open).toBe(true);
  });
});
