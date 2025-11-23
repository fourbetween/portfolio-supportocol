import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { AddCommentTypePopupPresenter } from "./add_comment_type";

describe("AddCommentTypePopupPresenter", () => {
  let elem: AddCommentTypePopupPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "add-comment-type-popup-presenter"
    ) as AddCommentTypePopupPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("タイトルが表示されること", async () => {
    await elem.updateComplete;
    const title = elem.shadowRoot?.querySelector('[slot="header"]');
    expect(title?.tagName).toBe("SPAN");
    expect(title?.textContent).toBe("コメント種類の追加");
  });

  it("追加ボタンを押すとaddイベントが発火すること", async () => {
    let eventFired = false;
    elem.addEventListener("add", () => {
      eventFired = true;
    });

    elem.open();
    await elem.updateComplete;

    const buttons = elem.shadowRoot?.querySelectorAll("button");
    const addButton = buttons?.[1];
    addButton?.click();

    expect(eventFired).toBe(true);
  });

  it("色を選択できること", async () => {
    elem.open();
    await elem.updateComplete;

    const colorOptions = elem.shadowRoot?.querySelectorAll(".color-option");
    const secondColor = colorOptions?.[1] as HTMLElement;

    secondColor.click();
    await elem.updateComplete;

    expect(secondColor.classList.contains("selected")).toBe(true);
    // Default selected was index 5 (grey)
    expect(colorOptions?.[5].classList.contains("selected")).toBe(false);
  });

  it("追加ボタンを押すと入力されたデータとともにaddイベントが発火すること", async () => {
    let eventDetail: any;
    elem.addEventListener("add", (e: any) => {
      eventDetail = e.detail;
    });

    elem.open();
    await elem.updateComplete;

    // Fill inputs
    const nameInput = elem.shadowRoot?.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    nameInput.value = "New Type";
    nameInput.dispatchEvent(new Event("input"));

    const descInput = elem.shadowRoot?.querySelector(
      "textarea"
    ) as HTMLTextAreaElement;
    descInput.value = "Description";
    descInput.dispatchEvent(new Event("input"));

    // Select color (index 1)
    const colorOptions = elem.shadowRoot?.querySelectorAll(".color-option");
    (colorOptions?.[1] as HTMLElement).click();

    const buttons = elem.shadowRoot?.querySelectorAll("button");
    const addButton = buttons?.[1];
    addButton?.click();

    expect(eventDetail).toEqual({
      name: "New Type",
      description: "Description",
      color: "#d29922",
    });
  });
});
