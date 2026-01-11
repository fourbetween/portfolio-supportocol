import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import {
  LearningDiscussionDeleteEvent,
  LearningDiscussionSelectEvent,
} from "../../event/discussion";
import "./discussion-item";

describe("learning-discussion-item", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const discussion = {
    id: "1",
    theme: "Test Theme",
    status: "public" as const,
  };

  it("テーマが表示されること", async () => {
    render(
      html`
        <learning-discussion-item
          .discussion=${discussion}
        ></learning-discussion-item>
      `,
      container
    );

    await expect.element(page.getByText("Test Theme")).toBeVisible();
  });

  it("クリックすると選択イベントが発火すること", async () => {
    const selectHandler = vi.fn();
    render(
      html`
        <learning-discussion-item
          .discussion=${discussion}
          @learning-discussion-select=${(e: Event) => selectHandler(e)}
        ></learning-discussion-item>
      `,
      container
    );

    await page.getByText("Test Theme").click();
    expect(selectHandler).toHaveBeenCalled();
    const event = selectHandler.mock.calls[0][0] as LearningDiscussionSelectEvent;
    expect(event.type).toBe("learning-discussion-select");
    expect(event.discussion).toEqual(discussion);
  });

  it("削除ボタンをクリックすると削除リクエストイベントが発火すること", async () => {
    const deleteHandler = vi.fn();
    render(
      html`
        <learning-discussion-item
          .discussion=${discussion}
          @learning-discussion-delete=${(e: Event) => deleteHandler(e)}
        ></learning-discussion-item>
      `,
      container
    );

    await page.getByRole("button", { name: "delete" }).click();
    expect(deleteHandler).toHaveBeenCalled();
    const event = deleteHandler.mock.calls[0][0] as LearningDiscussionDeleteEvent;
    expect(event.type).toBe("learning-discussion-delete");
    expect(event.discussion).toEqual(discussion);
  });

  it("ステータスとテーマが表示されること", async () => {
    render(
      html`
        <learning-discussion-item
          .discussion=${discussion}
        ></learning-discussion-item>
      `,
      container
    );

    await expect.element(page.getByText("public").first()).toBeVisible();
    await expect.element(page.getByText("Test Theme")).toBeVisible();
  });

  it("バッジが絶対配置され、右下に位置していること", async () => {
    render(
      html`
        <learning-discussion-item
          .discussion=${discussion}
        ></learning-discussion-item>
      `,
      container
    );

    const el = container.querySelector("learning-discussion-item")!;
    // Lit update waiting
    await (el as any).updateComplete;
    const badge = el.shadowRoot!.querySelector(
      "learning-discussion-status-badge"
    )! as HTMLElement;
    const styles = window.getComputedStyle(badge);

    expect(styles.position).toBe("absolute");
  });
});
