import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { CreateProjectPopupPresenter } from "./create";

describe("CreateProjectPopupPresenter", () => {
  let elem: CreateProjectPopupPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "create-project-popup-presenter"
    ) as CreateProjectPopupPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("プロジェクト名入力欄と作成ボタンが表示されること", async () => {
    await elem.updateComplete;

    const input = elem.shadowRoot?.querySelector("input#name");
    expect(input).toBeTruthy();

    const button = elem.shadowRoot?.querySelector("button");
    expect(button).toBeTruthy();
    expect(button?.textContent?.trim()).toBe("作成する");
  });
});
