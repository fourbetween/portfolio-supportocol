import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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

  it("種類がクリックされたときに select イベントが発火されること", async () => {
    const types = ["Question"];
    let selectedType = "";
    const onSelect = (e: any) => {
      selectedType = e.commentType;
    };
    render(
      html`
        <learning-comment-type-popup
          id="popup"
          .types=${types}
          @select=${onSelect}
        ></learning-comment-type-popup>
      `,
      container
    );
    const el = container.querySelector("#popup") as LearningCommentTypePopup;
    await el.updateComplete;
    el.open();

    await page.getByRole("button", { name: "Question" }).click();

    expect(selectedType).toBe("Question");
  });

  it("'Other...'がクリックされたときに入力フォームが表示され、入力値で select イベントが発火されること", async () => {
    let selectedType = "";
    const onSelect = (e: any) => {
      selectedType = e.commentType;
    };
    render(
      html`
        <learning-comment-type-popup
          id="popup"
          @select=${onSelect}
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

    expect(selectedType).toBe("Custom Type");
  });
});
