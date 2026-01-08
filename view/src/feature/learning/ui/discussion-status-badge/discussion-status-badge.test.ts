import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./discussion-status-badge";

describe("learning-discussion-status-badge", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("public ステータスが表示されること", async () => {
    render(
      html`
        <learning-discussion-status-badge
          .status=${"public"}
        ></learning-discussion-status-badge>
      `,
      container
    );

    await expect.element(page.getByText("public").nth(0)).toBeVisible();
    await expect
      .element(page.getByText("public").nth(0))
      .toHaveClass(/material-symbols-outlined/);
    await expect.element(page.getByText("public").nth(1)).toBeVisible();
    await expect.element(page.getByText("public").nth(1)).toHaveClass("label");
  });

  it("private ステータスが表示されること", async () => {
    render(
      html`
        <learning-discussion-status-badge
          .status=${"private"}
        ></learning-discussion-status-badge>
      `,
      container
    );

    await expect.element(page.getByText("lock")).toBeVisible();
    await expect
      .element(page.getByText("lock"))
      .toHaveClass(/material-symbols-outlined/);
    await expect.element(page.getByText("private")).toBeVisible();
    await expect.element(page.getByText("private")).toHaveClass("label");
  });
});
