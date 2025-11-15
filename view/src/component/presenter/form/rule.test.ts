import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { CommentType, CommentTypePath } from "../../../model/rule";
import type { RuleFormPresenter } from "./rule";

describe("RuleFormPresenter", async () => {
  let elem: RuleFormPresenter;

  beforeEach(async () => {
    elem = document.createElement("rule-form-presenter") as RuleFormPresenter;
    document.body.appendChild(elem);
    await elem.updateComplete;
  });

  afterEach(() => {
    elem.remove();
  });

  it("ルール名の入力欄が表示されること", async () => {
    await expect.element(page.getByText("ルール名")).toBeInTheDocument();
  });

  it("コメント種類セクションが表示されること", async () => {
    await expect.element(page.getByText("コメント種類")).toBeInTheDocument();
  });

  it("コメント種類が表示されること", async () => {
    const commentTypes: CommentType[] = [
      {
        id: "1",
        ruleId: "rule1",
        name: "主張",
        description: "議論のテーマに対する主張や意見を述べるコメント",
        color: "#0969DA",
      },
    ];
    elem.commentTypes = commentTypes;
    await elem.updateComplete;
    await expect.element(page.getByPlaceholder("例: 主張")).toBeInTheDocument();
  });

  it("コメント経路セクションが表示されること", async () => {
    await expect.element(page.getByText("コメント経路")).toBeInTheDocument();
  });

  it("コメント経路が表示されること", async () => {
    const commentTypes: CommentType[] = [
      {
        id: "1",
        ruleId: "rule1",
        name: "主張",
        description: "",
        color: "#0969DA",
      },
      {
        id: "2",
        ruleId: "rule1",
        name: "根拠",
        description: "",
        color: "#1A7F37",
      },
    ];
    const paths: CommentTypePath[] = [
      {
        id: "path1",
        ruleId: "rule1",
        fromCommentTypeId: "1",
        toCommentTypeId: "2",
      },
    ];
    elem.commentTypes = commentTypes;
    elem.commentTypePaths = paths;
    await elem.updateComplete;
    await expect.element(page.getByText("開始")).toBeInTheDocument();
    await expect.element(page.getByText("終了")).toBeInTheDocument();
  });
});
