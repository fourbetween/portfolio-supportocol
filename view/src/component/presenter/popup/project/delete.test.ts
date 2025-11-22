import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "./delete";
import type { DeleteProjectPopupPresenter } from "./delete";

describe("DeleteProjectPopupPresenter", () => {
  let elem: DeleteProjectPopupPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "delete-project-popup-presenter"
    ) as DeleteProjectPopupPresenter;
    elem.project = {
      id: "01H2X3J4K5L6M7N8P9Q0R1S2T3",
      name: "テストプロジェクト",
      createdBy: "01H2X3J4K5L6M7N8P9Q0R1S2T3",
      createdAt: "2023-01-01T00:00:00Z",
    };
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("タイトル「プロジェクトを削除しますか？」が表示されること", async () => {
    await elem.updateComplete;

    const header = elem.shadowRoot?.querySelector("[slot='header']");
    expect(header).toBeTruthy();
    expect(header?.textContent?.trim()).toBe("プロジェクトを削除しますか？");
  });

  it("警告文とプロジェクト名が表示されること", async () => {
    await elem.updateComplete;

    const main = elem.shadowRoot?.querySelector("[slot='main']");
    expect(main).toBeTruthy();
    expect(main?.textContent).toContain("この操作は取り消せません。");
    expect(main?.textContent).toContain("テストプロジェクト");

    const dangerText = main
      ?.querySelector(".danger-text")
      ?.textContent?.replace(/\s+/g, " ")
      .trim();
    expect(dangerText).toBe(
      "注意: 紐づいている議論は削除されませんが、このプロジェクトとの関連付けは解除されます。"
    );
  });

  it("確認入力欄と削除ボタンが表示されること", async () => {
    await elem.updateComplete;

    const label = elem.shadowRoot?.querySelector("label");
    expect(label?.textContent?.trim()).toBe(
      "確認のため、プロジェクト名を入力してください"
    );

    const input = elem.shadowRoot?.querySelector("input");
    expect(input).toBeTruthy();

    const cancelButton = elem.shadowRoot?.querySelector(
      "button:not(.btn-danger)"
    );
    expect(cancelButton?.textContent?.trim()).toBe("キャンセル");

    const deleteButton = elem.shadowRoot?.querySelector("button.btn-danger");
    expect(deleteButton?.textContent?.trim()).toBe("削除する");
    expect(deleteButton?.hasAttribute("disabled")).toBe(true);
  });
});
