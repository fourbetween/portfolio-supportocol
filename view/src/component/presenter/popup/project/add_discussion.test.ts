import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Discussion } from "../../../../model/discussion";
import type { AddDiscussionPopupPresenter } from "./add_discussion";

describe("AddDiscussionPopupPresenter", () => {
  let elem: AddDiscussionPopupPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "add-discussion-popup-presenter"
    ) as AddDiscussionPopupPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("タイトルが表示されること", async () => {
    await elem.updateComplete;

    const title = elem.shadowRoot?.querySelector("h2");
    expect(title).toBeTruthy();
    expect(title?.textContent?.trim()).toBe("既存の議論を追加");
  });

  it("検索入力欄が表示されること", async () => {
    await elem.updateComplete;

    const input = elem.shadowRoot?.querySelector("input");
    expect(input).toBeTruthy();
    expect(input?.placeholder).toBe("議論を検索...");
  });

  it("議論のリストが表示されること", async () => {
    const discussions: Discussion[] = [
      {
        id: "01H1V2W3X4Y5Z6A7B8C9D0E1F2",
        theme: "リモートワーク推奨期間の延長に関する是非",
        background: "",
        conclusion: "",
        ruleId: "01H1V2W3X4Y5Z6A7B8C9D0E1F2",
        visibilityLevel: "everyone",
        commentPermissionLevel: "everyone",
        createdBy: "user2",
        createdAt: "2023-01-01T00:00:00Z",
        status: "open",
      },
      {
        id: "01H1V2W3X4Y5Z6A7B8C9D0E1F3",
        theme: "2024年度 新規事業アイデア募集",
        background: "",
        conclusion: "",
        ruleId: "01H1V2W3X4Y5Z6A7B8C9D0E1F2",
        visibilityLevel: "everyone",
        commentPermissionLevel: "everyone",
        createdBy: "manager",
        createdAt: "2023-01-02T00:00:00Z",
        status: "archived",
      },
    ];

    elem.discussions = discussions;
    await elem.updateComplete;

    const items = elem.shadowRoot?.querySelectorAll(".result-item");
    expect(items?.length).toBe(2);

    const firstTitle = items?.[0].querySelector(".discussion-title");
    expect(firstTitle?.textContent?.trim()).toBe(
      "リモートワーク推奨期間の延長に関する是非"
    );
  });

  it("項目をクリックすると選択状態が切り替わること", async () => {
    const discussions: Discussion[] = [
      {
        id: "01H1V2W3X4Y5Z6A7B8C9D0E1F2",
        theme: "リモートワーク推奨期間の延長に関する是非",
        background: "",
        conclusion: "",
        ruleId: "01H1V2W3X4Y5Z6A7B8C9D0E1F2",
        visibilityLevel: "everyone",
        commentPermissionLevel: "everyone",
        createdBy: "user2",
        createdAt: "2023-01-01T00:00:00Z",
        status: "open",
      },
    ];
    elem.discussions = discussions;
    await elem.updateComplete;

    const item = elem.shadowRoot?.querySelector(".result-item") as HTMLElement;
    const checkbox = item.querySelector(
      "input[type='checkbox']"
    ) as HTMLInputElement;

    expect(item.classList.contains("selected")).toBe(false);
    expect(checkbox.checked).toBe(false);

    item.click();
    await elem.updateComplete;

    expect(item.classList.contains("selected")).toBe(true);
    expect(checkbox.checked).toBe(true);

    item.click();
    await elem.updateComplete;

    expect(item.classList.contains("selected")).toBe(false);
    expect(checkbox.checked).toBe(false);
  });

  it("選択状態に応じて追加ボタンの有効無効が切り替わること", async () => {
    const discussions: Discussion[] = [
      {
        id: "01H1V2W3X4Y5Z6A7B8C9D0E1F2",
        theme: "リモートワーク推奨期間の延長に関する是非",
        background: "",
        conclusion: "",
        ruleId: "01H1V2W3X4Y5Z6A7B8C9D0E1F2",
        visibilityLevel: "everyone",
        commentPermissionLevel: "everyone",
        createdBy: "user2",
        createdAt: "2023-01-01T00:00:00Z",
        status: "open",
      },
    ];
    elem.discussions = discussions;
    await elem.updateComplete;

    const addButton = elem.shadowRoot?.querySelector(
      "#add-btn"
    ) as HTMLButtonElement;
    expect(addButton).toBeTruthy();
    expect(addButton.disabled).toBe(true);

    const item = elem.shadowRoot?.querySelector(".result-item") as HTMLElement;
    item.click();
    await elem.updateComplete;

    expect(addButton.disabled).toBe(false);
  });
});
