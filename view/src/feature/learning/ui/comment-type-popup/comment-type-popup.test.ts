import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./comment-type-popup";
import type { LearningCommentTypePopup } from "./comment-type-popup";

describe("learning-comment-type-popup", () => {
  let el: LearningCommentTypePopup;

  beforeEach(async () => {
    el = document.createElement(
      "learning-comment-type-popup"
    ) as LearningCommentTypePopup;
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("提供された種類が表示されること", async () => {
    const types = ["Question", "Idea", "Agreement"];
    el.types = types;
    await el.updateComplete;

    const buttons = el.shadowRoot?.querySelectorAll(".type-button");
    expect(buttons?.length).toBe(3);
    expect(buttons?.[0].textContent?.trim()).toBe("Question");
    expect(buttons?.[1].textContent?.trim()).toBe("Idea");
    expect(buttons?.[2].textContent?.trim()).toBe("Agreement");
  });

  it("種類がクリックされたときに onSelect が呼ばれること", async () => {
    const types = ["Question"];
    const onSelect = vi.fn();
    el.types = types;
    el.onSelect = onSelect;
    await el.updateComplete;

    const button = el.shadowRoot?.querySelector(
      ".type-button"
    ) as HTMLButtonElement;
    button.click();

    expect(onSelect).toHaveBeenCalledWith("Question");
  });

  it("'Other...'がクリックされたときに入力フォームが表示され、入力値で onSelect が呼ばれること", async () => {
    const onSelect = vi.fn();
    el.onSelect = onSelect;
    await el.updateComplete;

    const otherButton = el.shadowRoot?.querySelector(
      ".other-button"
    ) as HTMLButtonElement;
    otherButton.click();
    await el.updateComplete;

    const input = el.shadowRoot?.querySelector(
      ".other-input"
    ) as HTMLInputElement;
    expect(input).toBeDefined();

    input.value = "Custom Type";
    input.dispatchEvent(new Event("input"));
    await el.updateComplete;

    const submitButton = el.shadowRoot?.querySelector(
      ".other-submit"
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(false);
    submitButton.click();

    expect(onSelect).toHaveBeenCalledWith("Custom Type");
  });
});
