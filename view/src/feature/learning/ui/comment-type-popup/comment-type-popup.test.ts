import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import "./comment-type-popup";
import type { LearningCommentTypePopup } from "./comment-type-popup";

describe("learning-comment-type-popup", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("提供された種類が表示されること", async () => {
    const types = ["Question", "Idea", "Agreement"];
    render(
      html`
        <learning-comment-type-popup
          id="popup"
          .types=${types}
        ></learning-comment-type-popup>
      `,
      container
    );
    const el = container.querySelector("#popup") as LearningCommentTypePopup;
    await el.updateComplete;
    el.open();

    await expect.element(page.getByText("Question")).toBeVisible();
    await expect.element(page.getByText("Idea")).toBeVisible();
    await expect.element(page.getByText("Agreement")).toBeVisible();
  });

  it("種類がクリックされたときに onSelect が呼ばれること", async () => {
    const types = ["Question"];
    const onSelect = vi.fn();
    render(
      html`
        <learning-comment-type-popup
          id="popup"
          .types=${types}
          .onSelect=${onSelect}
        ></learning-comment-type-popup>
      `,
      container
    );
    const el = container.querySelector("#popup") as LearningCommentTypePopup;
    await el.updateComplete;
    el.open();

    await page.getByRole("button", { name: "Question" }).click();

    expect(onSelect).toHaveBeenCalledWith("Question");
  });

  it("'Other...'がクリックされたときに入力フォームが表示され、入力値で onSelect が呼ばれること", async () => {
    const onSelect = vi.fn();
    render(
      html`
        <learning-comment-type-popup
          id="popup"
          .onSelect=${onSelect}
        ></learning-comment-type-popup>
      `,
      container
    );
    const el = container.querySelector("#popup") as LearningCommentTypePopup;
    await el.updateComplete;
    el.open();

    await page.getByRole("button", { name: "Other..." }).click();

    const input = page.getByPlaceholder("Type here...");
    await expect.element(input).toBeVisible();

    await input.fill("Custom Type");
    await page.getByRole("button", { name: "OK" }).click();

    expect(onSelect).toHaveBeenCalledWith("Custom Type");
  });
});
