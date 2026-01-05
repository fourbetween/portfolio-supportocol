import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { SearchDiscussionEvent } from "../../event/discussion";
import "./discussion-search-bar";

describe("learning-discussion-search-bar", async () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("入力値が変更されたときに search-discussion イベントが発火されること", async () => {
    const onSearch = vi.fn();
    render(
      html`
        <learning-discussion-search-bar
          @search-discussion=${(e: SearchDiscussionEvent) => onSearch(e.query)}
        ></learning-discussion-search-bar>
      `,
      container
    );

    const input = page.getByRole("textbox", { name: "Search discussions" });
    await input.fill("test query");

    expect(onSearch).toHaveBeenCalledWith("test query");
  });
});
