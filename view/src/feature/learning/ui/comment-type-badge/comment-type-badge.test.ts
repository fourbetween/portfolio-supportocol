import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./comment-type-badge";

describe("learning-comment-type-badge", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("コメントの種類が表示されること", async () => {
    const type = "idea";
    render(
      html`
        <learning-comment-type-badge
          .type=${type}
        ></learning-comment-type-badge>
      `,
      container
    );

    await expect.element(page.getByText("idea")).toBeVisible();
  });

  it("バッジのスタイルが適用されていること", async () => {
    const type = "idea";
    render(
      html`
        <learning-comment-type-badge
          .type=${type}
        ></learning-comment-type-badge>
      `,
      container
    );

    const badge = page.getByText("idea");
    await expect.element(badge).toBeVisible();

    const element = badge.element();
    const style = window.getComputedStyle(element);
    expect(style.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(style.borderRadius).not.toBe("0px");
  });
});
