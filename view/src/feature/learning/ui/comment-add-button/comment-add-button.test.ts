import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./comment-add-button";

describe("learning-comment-add-button", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("isReply が false の場合、'New Comment' と表示されること", async () => {
    render(
      html`
        <learning-comment-add-button
          .isReply=${false}
        ></learning-comment-add-button>
      `,
      container
    );
    await expect.element(page.getByText("New Comment")).toBeVisible();
  });

  it("isReply が true の場合、'Reply' と表示されること", async () => {
    render(
      html`
        <learning-comment-add-button
          .isReply=${true}
        ></learning-comment-add-button>
      `,
      container
    );
    await expect.element(page.getByText("Reply")).toBeVisible();
  });
});
