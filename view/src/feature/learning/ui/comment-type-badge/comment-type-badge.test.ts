import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./comment-type-badge";
import type { LearningCommentTypeBadge } from "./comment-type-badge";

describe("learning-comment-type-badge", async () => {
  let elem: LearningCommentTypeBadge;

  beforeEach(() => {
    elem = document.createElement(
      "learning-comment-type-badge"
    ) as LearningCommentTypeBadge;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("コメントの種類が表示されること", async () => {
    elem.type = "idea";
    await expect.element(page.getByText("idea")).toBeInTheDocument();
  });

  it("バッジのスタイルが適用されていること", async () => {
    elem.type = "idea";
    await elem.updateComplete;
    const label = elem.shadowRoot?.querySelector(".type-label");
    const style = window.getComputedStyle(label!);
    expect(style.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(style.borderRadius).not.toBe("0px");
  });
});
