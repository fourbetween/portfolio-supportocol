import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { Rule } from "../../../model/rule";
import type { RuleDetailsPresenter } from "./rule";

describe("RuleDetailsPresenter", async () => {
  let elem: RuleDetailsPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "rule-details-presenter"
    ) as RuleDetailsPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  const mockRule: Rule = {
    id: "rule1",
    name: "議論ルール",
    description: "議論のルール説明文",
    createdBy: "user1",
    createdAt: "2024-01-01T00:00:00Z",
    commentTypes: [
      {
        id: "type1",
        no: 0,
        name: "主張",
        description: "議論の主張を述べる",
        color: "#0969da",
      },
      {
        id: "type2",
        no: 1,
        name: "根拠",
        description: "主張を裏付ける根拠を述べる",
        color: "#2da44e",
      },
    ],
    commentTypePaths: [
      {
        childCommentTypeId: "type1",
        parentCommentTypeId: "type2",
      },
    ],
  };

  it("ルール名がサマリーに表示されること", async () => {
    elem.rule = mockRule;
    await elem.updateComplete;
    await expect.element(page.getByText("ルール: 議論ルール")).toBeVisible();
  });

  it("詳細を開くとルールの説明が表示されること", async () => {
    elem.rule = mockRule;
    await elem.updateComplete;

    const details = elem.shadowRoot?.querySelector(
      ".rule-details"
    ) as HTMLDetailsElement;
    details.open = true;
    await elem.updateComplete;

    await expect.element(page.getByText("議論のルール説明文")).toBeVisible();
  });

  it("詳細を開くとコメント種類一覧が表示されること", async () => {
    elem.rule = mockRule;
    await elem.updateComplete;

    const details = elem.shadowRoot?.querySelector(
      ".rule-details"
    ) as HTMLDetailsElement;
    details.open = true;
    await elem.updateComplete;

    await expect.element(page.getByText("コメント種類")).toBeVisible();
    const commentTypeItems = elem.shadowRoot?.querySelectorAll(
      ".rule-comment-type-item"
    );
    expect(commentTypeItems?.length).toBe(2);
  });

  it("詳細を開くと経路設定が表示されること", async () => {
    elem.rule = mockRule;
    await elem.updateComplete;

    const details = elem.shadowRoot?.querySelector(
      ".rule-details"
    ) as HTMLDetailsElement;
    details.open = true;
    await elem.updateComplete;

    await expect.element(page.getByText("経路")).toBeVisible();
    const pathItems = elem.shadowRoot?.querySelectorAll(".rule-path-item");
    expect(pathItems?.length).toBe(1);
  });

  it("ruleがundefinedの場合は何も表示されないこと", async () => {
    elem.rule = undefined;
    await elem.updateComplete;

    const details = elem.shadowRoot?.querySelector(".rule-details");
    expect(details).toBeNull();
  });
});
