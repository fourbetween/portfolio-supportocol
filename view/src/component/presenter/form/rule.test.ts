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
        no: 0,
        name: "主張",
        description: "自分の意見や提案を述べるコメント",
        color: "#0969da",
      },
      {
        id: "01234567890123456789012348",
        no: 1,
        name: "根拠",
        description: "主張を裏付ける根拠",
        color: "#1a7f37",
      },
    ],
    commentTypePaths: [
      {
        childCommentTypeId: "01234567890123456789012347",
        parentCommentTypeId: "01234567890123456789012348",
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
    const input = page.getByLabelText("ルール名");
    await expect.element(input).toBeVisible();
    await expect.element(input).toHaveValue("基本的な議論");
  });

  it("コメント種類の上へ移動ボタンをクリックすると順序が変わること", async () => {
    let updatedRule: Rule | undefined;
    elem.onRuleChange = (rule) => {
      updatedRule = rule;
    };

    const moveUpButtons = page.getByRole("button", { name: "上へ移動" });
    // 2番目のコメント種類（根拠）の上へ移動ボタンをクリック
    await moveUpButtons.nth(1).click();

    expect(updatedRule).toBeDefined();
    expect(updatedRule!.commentTypes[0].name).toBe("根拠");
    expect(updatedRule!.commentTypes[1].name).toBe("主張");
  });

  it("コメント種類の下へ移動ボタンをクリックすると順序が変わること", async () => {
    let updatedRule: Rule | undefined;
    elem.onRuleChange = (rule) => {
      updatedRule = rule;
    };

    const moveDownButtons = page.getByRole("button", { name: "下へ移動" });
    // 1番目のコメント種類（主張）の下へ移動ボタンをクリック
    await moveDownButtons.nth(0).click();

    expect(updatedRule).toBeDefined();
    expect(updatedRule!.commentTypes[0].name).toBe("根拠");
    expect(updatedRule!.commentTypes[1].name).toBe("主張");
  });
});
