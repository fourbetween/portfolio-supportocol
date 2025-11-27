import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { Rule } from "../../../model/rule";
import type { RuleFormPresenter } from "./rule";

describe("RuleFormPresenter", async () => {
  let elem: RuleFormPresenter;

  const mockRule: Rule = {
    id: "01234567890123456789012345",
    name: "基本的な議論",
    description: "論理的な議論を行うための基本的なルールセットです。",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-01T00:00:00Z",
    commentTypes: [
      {
        id: "01234567890123456789012347",
        name: "主張",
        description: "自分の意見や提案を述べるコメント",
        color: "#0969da",
      },
      {
        id: "01234567890123456789012348",
        name: "根拠",
        description: "主張を裏付ける根拠",
        color: "#1a7f37",
      },
    ],
    commentTypePaths: [
      {
        fromCommentTypeId: "01234567890123456789012347",
        toCommentTypeId: "01234567890123456789012348",
      },
    ],
  };

  beforeEach(() => {
    elem = document.createElement("rule-form-presenter") as RuleFormPresenter;
    elem.rule = mockRule;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("ルール名の入力欄が表示されること", async () => {
    await elem.updateComplete;
    const input = page.getByLabelText("ルール名");
    await expect.element(input).toBeVisible();
    await expect.element(input).toHaveValue("基本的な議論");
  });
});
