import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./discussion-search-bar";
import type { LearningDiscussionSearchBar } from "./discussion-search-bar";

describe("learning-discussion-search-bar", async () => {
  let elem: LearningDiscussionSearchBar;

  beforeEach(() => {
    elem = document.createElement(
      "learning-discussion-search-bar"
    ) as LearningDiscussionSearchBar;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("入力値が変更されたときに onInput が呼ばれること", async () => {
    const onInput = vi.fn();
    elem.onInput = onInput;
    await elem.updateComplete;

    const input = elem.shadowRoot!.querySelector("input")!;
    input.value = "test query";
    input.dispatchEvent(new InputEvent("input"));

    expect(onInput).toHaveBeenCalledWith("test query");
  });
});
