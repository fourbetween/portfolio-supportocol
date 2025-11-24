import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { Rule } from "../../../../model/rule";
import type { EditRuleFormPresenter } from "./edit";

describe("EditRuleFormPresenter", async () => {
  let elem: EditRuleFormPresenter;

  const rule: Rule = {
    id: "01J8Y000000000000000000001",
    name: "基本的な議論",
    description: "論理的な議論を行うための基本的なルールセットです。",
    createdBy: "admin",
    createdAt: "2023-10-01T00:00:00Z",
    commentTypes: [
      {
        id: "01J8Y000000000000000000011",
        name: "主張 (Proposition)",
        description: "自分の意見や提案を述べるコメント",
        color: "#0969da",
      },
      {
        id: "01J8Y000000000000000000012",
        name: "質問 (Question)",
        description: "不明点を確認するコメント",
        color: "#d29922",
      },
    ],
    commentTypePaths: [
      {
        fromCommentTypeId: "01J8Y000000000000000000011",
        toCommentTypeId: "01J8Y000000000000000000012",
      },
    ],
  };

  beforeEach(() => {
    elem = document.createElement(
      "edit-rule-form-presenter"
    ) as EditRuleFormPresenter;
    elem.rule = rule;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("ルール名が入力欄に表示されること", async () => {
    const input = page.getByLabelText("ルール名");
    await expect.element(input).toHaveValue("基本的な議論");
  });

  it("コメント種類が表示されること", async () => {
    const propositionTitle = page.getByText("主張 (Proposition)").first();
    await expect.element(propositionTitle).toBeInTheDocument();

    const questionTitle = page.getByText("質問 (Question)").first();
    await expect.element(questionTitle).toBeInTheDocument();
  });

  it("コメント種類の返信許可設定が正しく表示されること", async () => {
    const heading = page.getByRole("heading", {
      name: "構造定義 (コメント種類と経路)",
    });
    await expect.element(heading).toBeInTheDocument();
  });
});
