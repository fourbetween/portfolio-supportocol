import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { Rule } from "../../../model/rule";
import type { RuleListPresenter } from "./rule";

describe("RuleListPresenter", async () => {
  let elem: RuleListPresenter;

  const rules: Rule[] = [
    {
      id: "01J8Y000000000000000000001",
      name: "ディベート標準ルール",
      description:
        "肯定側と否定側に分かれて議論を行うための標準的なルールセットです。",
      createdBy: "admin",
      createdAt: "2023-10-01T00:00:00Z",
      commentTypes: [],
      commentTypePaths: [],
    },
    {
      id: "01J8Y000000000000000000002",
      name: "ブレインストーミング",
      description:
        "アイデアを自由に出し合うためのルール。批判的なコメントを制限しています。",
      createdBy: "user123",
      createdAt: "2023-09-28T00:00:00Z",
      commentTypes: [],
      commentTypePaths: [],
    },
  ];

  beforeEach(() => {
    elem = document.createElement("rule-list-presenter") as RuleListPresenter;
    elem.rules = rules;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("ルール一覧が表示されること", async () => {
    await expect
      .element(page.getByText("ディベート標準ルール"))
      .toBeInTheDocument();
    await expect
      .element(page.getByText("ブレインストーミング"))
      .toBeInTheDocument();
  });
});
