import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
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
    authorId: "user1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
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
          @discussion-select=${(e: Event) => selectHandler(e)}
        ></learning-discussion-item>
      `,
      container
    );

    await page.getByText("Test Theme").click();
    expect(selectHandler).toHaveBeenCalled();
    const event = selectHandler.mock.calls[0][0];
    expect(event.type).toBe("discussion-select");
    expect(event.discussion).toEqual(discussion);
  });

  it("削除ボタンをクリックすると削除リクエストイベントが発火すること", async () => {
    const deleteHandler = vi.fn();
    render(
      html`
        <learning-discussion-item
          .discussion=${discussion}
          @discussion-delete=${(e: Event) => deleteHandler(e)}
        ></learning-discussion-item>
      `,
      container
    );

    await page.getByRole("button", { name: "delete" }).click();
    expect(deleteHandler).toHaveBeenCalled();
    const event = deleteHandler.mock.calls[0][0];
    expect(event.type).toBe("discussion-delete");
    expect(event.discussion).toEqual(discussion);
  });
});
