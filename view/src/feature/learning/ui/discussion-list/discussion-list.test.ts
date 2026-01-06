import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type {
  DiscussionDeleteEvent,
  SelectDiscussionEvent,
} from "../../event/discussion";
import "./discussion-list";

describe("learning-discussion-list", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("議論のテーマが表示されること", async () => {
    const discussions = [
      { id: "1", theme: "テーマ1" },
      { id: "2", theme: "テーマ2" },
    ];
    render(
      html`
        <learning-discussion-list
          .discussions=${discussions}
        ></learning-discussion-list>
      `,
      container
    );

    await expect.element(page.getByText("テーマ1")).toBeVisible();
    await expect.element(page.getByText("テーマ2")).toBeVisible();
  });

  it("議論がない場合にメッセージが表示されること", async () => {
    render(
      html`
        <learning-discussion-list .discussions=${[]}></learning-discussion-list>
      `,
      container
    );

    await expect.element(page.getByText("No discussions found.")).toBeVisible();
  });

  it("アイテムをクリックすると discussion-select イベントが発火されること", async () => {
    const onSelect = vi.fn();
    const discussions = [{ id: "1", theme: "テーマ1" }];
    render(
      html`
        <learning-discussion-list
          .discussions=${discussions}
          @discussion-select=${(e: SelectDiscussionEvent) =>
            onSelect(e.discussion)}
        ></learning-discussion-list>
      `,
      container
    );

    await page.getByText("テーマ1").click();

    expect(onSelect).toHaveBeenCalledWith(discussions[0]);
  });

  it("削除ボタンをクリックすると discussion-delete イベントが発火されること", async () => {
    const onDelete = vi.fn();
    const discussions = [{ id: "1", theme: "テーマ1" }];
    render(
      html`
        <learning-discussion-list
          .discussions=${discussions}
          @discussion-delete=${(e: DiscussionDeleteEvent) =>
            onDelete(e.discussion)}
        ></learning-discussion-list>
      `,
      container
    );

    const item = page.getByText("テーマ1");
    await item.hover();
    await page.getByRole("button", { name: "delete" }).click();

    expect(onDelete).toHaveBeenCalledWith(discussions[0]);
  });

  it("削除ボタンが絶対配置されていること", async () => {
    const discussions = [{ id: "1", theme: "テーマ1" }];
    render(
      html`
        <learning-discussion-list
          .discussions=${discussions}
        ></learning-discussion-list>
      `,
      container
    );

    const deleteButton = page.getByRole("button", { name: "delete" });
    await expect.element(deleteButton).toBeInTheDocument();

    const element = deleteButton.element();
    const style = window.getComputedStyle(element);
    expect(style.position).toBe("absolute");
  });

  it("アイテムコンテナが相対配置されていること", async () => {
    const discussions = [{ id: "1", theme: "テーマ1" }];
    render(
      html`
        <learning-discussion-list
          .discussions=${discussions}
        ></learning-discussion-list>
      `,
      container
    );

    const item = page.getByText("テーマ1");
    await expect.element(item).toBeVisible();

    const element = item.element();
    const itemElement = element.closest(".item");
    const style = window.getComputedStyle(itemElement!);
    expect(style.position).toBe("relative");
  });
});
