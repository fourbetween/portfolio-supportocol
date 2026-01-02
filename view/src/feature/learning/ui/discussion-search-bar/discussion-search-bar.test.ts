import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
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

  it("入力値が変更されたときに onInput が呼ばれること", async () => {
    const onInput = vi.fn();
    render(
      html`
        <learning-discussion-search-bar
          .onInput=${onInput}
        ></learning-discussion-search-bar>
      `,
      container
    );

    const input = page.getByRole("textbox", { name: "Search discussions" });
    await input.fill("test query");

    expect(onInput).toHaveBeenCalledWith("test query");
  });
});
