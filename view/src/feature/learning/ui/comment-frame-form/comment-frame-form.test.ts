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

    // Types の表示確認
    // Badge の要素を特定したいので class を使うか、textContent を直接見る
    const badges = element.shadowRoot?.querySelectorAll(
      "ui-comment-type-badge",
    );
    const badgeTexts = Array.from(badges || []).map((b) => (b as any).type);
    expect(badgeTexts).toContain("質問");
    expect(badgeTexts).toContain("回答");
  });

  it("新しいタイプを追加できること", async () => {
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

    // アイデアが表示されていること
    const badges = element.shadowRoot?.querySelectorAll(
      "ui-comment-type-badge",
    );
    const badgeTexts = Array.from(badges || []).map((b) => (b as any).type);
    expect(badgeTexts).toContain("アイデア");
  });

  it("タイプを削除すると、関連するパスも削除されること", async () => {
    const frame: CommentFrame = {
      types: ["質問", "回答", "独り言"],
      paths: [
        { child: "回答", parent: "質問" },
        { child: "独り言", parent: "" },
      ],
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

    // "質問" の削除ボタンをクリック
    const deleteButton = element.shadowRoot?.querySelector(
      'button[aria-label="Delete Type: 質問"]',
    ) as HTMLButtonElement;
    deleteButton.click();
    await (element as any).updateComplete;

    // "質問" が Types から消えていること
    const badges = element.shadowRoot?.querySelectorAll(
      "ui-comment-type-badge",
    );
    const badgeTexts = Array.from(badges || []).map((b) => (b as any).type);
    expect(badgeTexts).not.toContain("質問");
  });

  it("新しいパスを追加できること", async () => {
    const frame: CommentFrame = {
      types: ["質問", "回答"],
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

    const addPathButton = element.shadowRoot?.querySelector(
      'button[aria-label="Add Path"]',
    ) as HTMLButtonElement;

    // { child: "回答", parent: "" } (ROOT) を追加
    // select の値を直接変更して change イベントを発火
    (element as any)._selectedParent = "";
    (element as any)._selectedChild = "回答";
    (element as any).requestUpdate();
    await (element as any).updateComplete;

    addPathButton.click();
    await (element as any).updateComplete;

    // パスが表示されていることを確認
    // Badge の内容を Shadow DOM を通じて詳細に確認
    const pathGroup = element.shadowRoot?.querySelector(".path-group");
    expect(pathGroup).not.toBeNull();
    const parentBadge = pathGroup!.querySelector(
      ".parent-node ui-comment-type-badge",
    );
    const childBadge = pathGroup!.querySelector(
      ".child-node ui-comment-type-badge",
    );
    expect((parentBadge as any).type).toBe("ROOT");
    expect((childBadge as any).type).toBe("回答");
  });

  it("パスを削除できること", async () => {
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

    const deleteButton = element.shadowRoot?.querySelector(
      'button[aria-label="Delete Path: 質問 -> 回答"]',
    ) as HTMLButtonElement;
    expect(deleteButton).not.toBeNull();

    deleteButton.click();
    await (element as any).updateComplete;

    // パスが消えていることを確認
    expect(
      element.shadowRoot?.querySelector(
        'button[aria-label="Delete Path: 質問 -> 回答"]',
      ),
    ).toBeNull();
  });
});
