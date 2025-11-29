import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { Issue } from "../../../../model/discussion";
import type { ListIssuePopupPresenter } from "./list";

describe("ListIssuePopupPresenter", async () => {
  let elem: ListIssuePopupPresenter;

  const mockIssues: Issue[] = [
    {
      id: "01234567890123456789012370",
      commentId: "01234567890123456789012360",
      issueType: "contradiction",
      description: "矛盾の指摘です",
      createdBy: "01234567890123456789012346",
      createdAt: "2024-01-01T14:00:00Z",
    },
    {
      id: "01234567890123456789012371",
      commentId: "01234567890123456789012360",
      issueType: "circular_logic",
      description: "循環論法の指摘です",
      createdBy: "01234567890123456789012346",
      createdAt: "2024-01-01T15:00:00Z",
    },
  ];

  beforeEach(() => {
    elem = document.createElement(
      "list-issue-popup-presenter"
    ) as ListIssuePopupPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("ポップアップが開くとダイアログが表示されること", async () => {
    elem.issues = mockIssues;
    await elem.updateComplete;
    elem.open();

    await expect.element(page.getByRole("dialog")).toBeVisible();
  });

  it("指摘一覧のヘッダーが表示されること", async () => {
    elem.issues = mockIssues;
    await elem.updateComplete;
    elem.open();

    await expect.element(page.getByText("指摘一覧")).toBeVisible();
  });

  it("指摘の種類が表示されること", async () => {
    elem.issues = mockIssues;
    await elem.updateComplete;
    elem.open();
    await elem.updateComplete;

    const badges = elem.shadowRoot?.querySelectorAll(".issue-type-badge");
    expect(badges?.length).toBe(2);
    expect(badges?.[0]?.textContent?.trim()).toBe("矛盾");
    expect(badges?.[1]?.textContent?.trim()).toBe("循環論法");
  });

  it("指摘の説明が表示されること", async () => {
    elem.issues = mockIssues;
    await elem.updateComplete;
    elem.open();
    await elem.updateComplete;

    const descriptions =
      elem.shadowRoot?.querySelectorAll(".issue-description");
    expect(descriptions?.length).toBe(2);
    expect(descriptions?.[0]?.textContent?.trim()).toBe("矛盾の指摘です");
    expect(descriptions?.[1]?.textContent?.trim()).toBe("循環論法の指摘です");
  });

  it("閉じるボタンクリックでポップアップが閉じること", async () => {
    elem.issues = mockIssues;
    await elem.updateComplete;
    elem.open();

    await page.getByRole("button", { name: "閉じる" }).click();

    // ダイアログはclose()後はopen属性がなくなる
    const dialog = elem.shadowRoot
      ?.querySelector("base-popup-presenter")
      ?.shadowRoot?.querySelector("dialog");
    expect(dialog?.hasAttribute("open")).toBe(false);
  });

  it("矛盾バッジが濃い赤色で表示されること", async () => {
    elem.issues = [
      {
        id: "01234567890123456789012370",
        commentId: "01234567890123456789012360",
        issueType: "contradiction",
        description: "矛盾の指摘です",
        createdBy: "01234567890123456789012346",
        createdAt: "2024-01-01T14:00:00Z",
      },
    ];
    await elem.updateComplete;
    elem.open();
    await elem.updateComplete;

    const badge = elem.shadowRoot?.querySelector(
      '.issue-type-badge[data-type="contradiction"]'
    ) as HTMLElement;
    const styles = getComputedStyle(badge);
    // 背景色が濃い赤(#cf222e)であること
    expect(styles.backgroundColor).toBe("rgb(207, 34, 46)");
  });

  it("循環論法バッジが濃い黄色で表示されること", async () => {
    elem.issues = [
      {
        id: "01234567890123456789012371",
        commentId: "01234567890123456789012360",
        issueType: "circular_logic",
        description: "循環論法の指摘です",
        createdBy: "01234567890123456789012346",
        createdAt: "2024-01-01T15:00:00Z",
      },
    ];
    await elem.updateComplete;
    elem.open();
    await elem.updateComplete;

    const badge = elem.shadowRoot?.querySelector(
      '.issue-type-badge[data-type="circular_logic"]'
    ) as HTMLElement;
    const styles = getComputedStyle(badge);
    // 背景色が濃い黄色(#9a6700)であること
    expect(styles.backgroundColor).toBe("rgb(154, 103, 0)");
  });

  it("指摘がない場合は空メッセージが表示されること", async () => {
    elem.issues = [];
    await elem.updateComplete;
    elem.open();
    await elem.updateComplete;

    const emptyMessage = elem.shadowRoot?.querySelector(".empty-message");
    expect(emptyMessage).not.toBeNull();
    expect(emptyMessage?.textContent?.trim()).toBe("指摘がありません");
  });
});
