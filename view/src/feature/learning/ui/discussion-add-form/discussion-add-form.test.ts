import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./discussion-add-form";
import type { LearningDiscussionAddForm } from "./discussion-add-form";

describe("learning-discussion-add-form", async () => {
  let elem: LearningDiscussionAddForm;

  beforeEach(() => {
    elem = document.createElement(
      "learning-discussion-add-form"
    ) as LearningDiscussionAddForm;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("テーマを入力して追加ボタンを押したときに onSubmit が呼ばれること", async () => {
    const onSubmit = vi.fn();
    elem.onSubmit = onSubmit;
    await elem.updateComplete;

    const input = elem.shadowRoot!.querySelector("input")!;
    input.value = "新しい議論";
    input.dispatchEvent(new InputEvent("input"));
    await elem.updateComplete;

    const button = elem.shadowRoot!.querySelector("button")!;
    button.click();

    expect(onSubmit).toHaveBeenCalledWith("新しい議論");
  });
});
