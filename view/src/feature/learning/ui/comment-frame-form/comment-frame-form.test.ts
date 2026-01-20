import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { CommentFrame } from "../../model/comment-frame";
import "./comment-frame-form";

describe("learning-comment-frame-form", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("初期値の CommentFrame の内容が表示されること", async () => {
    const frame: CommentFrame = {
      types: ["質問", "回答"],
      paths: [{ child: "回答", parent: "質問" }],
    };

    render(
      html`
        <learning-comment-frame-form
          .initialFrame=${frame}
        ></learning-comment-frame-form>
      `,
      container,
    );
    const element = container.querySelector("learning-comment-frame-form")!;
    await (element as any).updateComplete;

    const badges = element.shadowRoot?.querySelectorAll(
      "ui-comment-type-badge",
    );
    const badgeTexts = Array.from(badges || []).map((b) => (b as any).type);
    expect(badgeTexts).toContain("質問");
    expect(badgeTexts).toContain("回答");
  });

  it("新しいタイプを追加し、削除できること", async () => {
    render(
      html`
        <learning-comment-frame-form></learning-comment-frame-form>
      `,
      container,
    );
    const element = container.querySelector("learning-comment-frame-form")!;
    await (element as any).updateComplete;

    const input = element.shadowRoot?.querySelector(
      'input[placeholder="New type..."]',
    ) as HTMLInputElement;
    const addButton = element.shadowRoot?.querySelector(
      'button[aria-label="Add Type"]',
    ) as HTMLButtonElement;

    input.value = "アイデア";
    input.dispatchEvent(new Event("input"));
    addButton.click();
    await (element as any).updateComplete;

    let badges = element.shadowRoot?.querySelectorAll("ui-comment-type-badge");
    let badgeTexts = Array.from(badges || []).map((b) => (b as any).type);
    expect(badgeTexts).toContain("アイデア");

    // 削除
    const deleteButton = element.shadowRoot?.querySelector(
      'button[aria-label="Delete Type: アイデア"]',
    ) as HTMLButtonElement;
    deleteButton.click();
    await (element as any).updateComplete;

    badges = element.shadowRoot?.querySelectorAll("ui-comment-type-badge");
    badgeTexts = Array.from(badges || []).map((b) => (b as any).type);
    expect(badgeTexts).not.toContain("アイデア");
  });

  it("usedFrame に含まれるタイプやパスは削除できないが、それ以外は削除できること", async () => {
    const initialFrame: CommentFrame = {
      types: ["質問", "回答", "未利用"],
      paths: [
        { child: "回答", parent: "質問" },
        { child: "未利用", parent: "質問" },
      ],
    };

    const usedFrame: CommentFrame = {
      types: ["質問", "回答"],
      paths: [{ child: "回答", parent: "質問" }],
    };

    render(
      html`
        <learning-comment-frame-form
          .initialFrame=${initialFrame}
          .usedFrame=${usedFrame}
        ></learning-comment-frame-form>
      `,
      container,
    );
    const element = container.querySelector("learning-comment-frame-form")!;
    await (element as any).updateComplete;

    // usedFrame にあるタイプ "質問" の削除ボタンは存在しない
    expect(
      element.shadowRoot?.querySelector(
        'button[aria-label="Delete Type: 質問"]',
      ),
    ).toBeNull();

    // usedFrame にないタイプ "未利用" の削除ボタンは存在すること
    expect(
      element.shadowRoot?.querySelector(
        'button[aria-label="Delete Type: 未利用"]',
      ),
    ).not.toBeNull();

    // usedFrame にあるパス "質問 -> 回答" の削除ボタンは存在しない
    expect(
      element.shadowRoot?.querySelector(
        'button[aria-label="Delete Path: 質問 -> 回答"]',
      ),
    ).toBeNull();

    // usedFrame にないパス "質問 -> 未利用" の削除ボタンは存在すること
    expect(
      element.shadowRoot?.querySelector(
        'button[aria-label="Delete Path: 質問 -> 未利用"]',
      ),
    ).not.toBeNull();
  });

  it("追加したタイプを削除すると、それを使った追加済みのパスも削除されること", async () => {
    const frame: CommentFrame = {
      types: ["質問"],
      paths: [],
    };

    render(
      html`
        <learning-comment-frame-form
          .initialFrame=${frame}
        ></learning-comment-frame-form>
      `,
      container,
    );
    const element = container.querySelector("learning-comment-frame-form")!;
    await (element as any).updateComplete;

    // タイプ "アイデア" を追加
    const input = element.shadowRoot?.querySelector(
      'input[placeholder="New type..."]',
    ) as HTMLInputElement;
    const addTypeButton = element.shadowRoot?.querySelector(
      'button[aria-label="Add Type"]',
    ) as HTMLButtonElement;
    input.value = "アイデア";
    input.dispatchEvent(new Event("input"));
    addTypeButton.click();
    await (element as any).updateComplete;

    // パス "質問" -> "アイデア" を追加
    (element as any)._selectedParent = "質問";
    (element as any)._selectedChild = "アイデア";
    (element as any).requestUpdate();
    await (element as any).updateComplete;
    const addPathButton = element.shadowRoot?.querySelector(
      'button[aria-label="Add Path"]',
    ) as HTMLButtonElement;
    addPathButton.click();
    await (element as any).updateComplete;

    // パスがあることを確認
    expect(
      element.shadowRoot?.querySelector(
        'button[aria-label="Delete Path: 質問 -> アイデア"]',
      ),
    ).not.toBeNull();

    // タイプ "アイデア" を削除
    const deleteTypeButton = element.shadowRoot?.querySelector(
      'button[aria-label="Delete Type: アイデア"]',
    ) as HTMLButtonElement;
    deleteTypeButton.click();
    await (element as any).updateComplete;

    // パスも消えていること
    expect(
      element.shadowRoot?.querySelector(
        'button[aria-label="Delete Path: 質問 -> アイデア"]',
      ),
    ).toBeNull();
  });
});
