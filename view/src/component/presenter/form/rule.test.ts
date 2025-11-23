import { customElement } from "lit/decorators.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { AddCommentTypePopupPresenter } from "../popup/rule/add_comment_type";
import { RuleFormPresenter } from "./rule";

@customElement("test-rule-form-presenter")
class TestRuleFormPresenter extends RuleFormPresenter {
  render() {
    return this.renderForm();
  }
}

describe("RuleFormPresenter", () => {
  let elem: TestRuleFormPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "test-rule-form-presenter"
    ) as TestRuleFormPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("「+ コメント種類を追加」ボタンをクリックすると、ポップアップが開くこと", async () => {
    const button = page.getByText("+ コメント種類を追加");
    await expect.element(button).toBeInTheDocument();

    await button.click();

    // Expect the popup title to be visible
    await expect.element(page.getByText("コメント種類の追加")).toBeVisible();
  });

  it("ポップアップで追加ボタンが押されると、新しいコメント種類が追加されること", async () => {
    const button = page.getByText("+ コメント種類を追加");
    await button.click();

    const popup = elem.shadowRoot?.querySelector(
      "add-comment-type-popup-presenter"
    ) as AddCommentTypePopupPresenter;

    // Simulate add event from popup
    popup.dispatchEvent(
      new CustomEvent("add", {
        detail: {
          name: "New Type",
          description: "Description",
          color: "#d29922",
        },
      })
    );

    await elem.updateComplete;

    expect(elem.rule.commentTypes).toHaveLength(1);
    expect(elem.rule.commentTypes[0]).toMatchObject({
      name: "New Type",
      description: "Description",
      color: "#d29922",
    });

    // Also check if it is rendered in the list
    await expect.element(page.getByText("New Type").first()).toBeVisible();
  });

  it("チェックボックスを変更したとき、ruleプロパティのcommentTypePathsが更新されること", async () => {
    // Setup rule with two comment types
    const parentType = {
      id: "parent-id",
      ruleId: "rule-id",
      name: "Parent Type",
      description: "",
      color: "#ffffff",
    };
    const childType = {
      id: "child-id",
      ruleId: "rule-id",
      name: "Child Type",
      description: "",
      color: "#000000",
    };

    elem.rule = {
      ...elem.rule,
      commentTypes: [parentType, childType],
      commentTypePaths: [],
    };
    await elem.updateComplete;

    const checkboxLabel = page.getByText("Child Type").first();
    await checkboxLabel.click();

    await elem.updateComplete;

    // Verify path added
    expect(elem.rule.commentTypePaths).toHaveLength(1);
    expect(elem.rule.commentTypePaths[0]).toMatchObject({
      fromCommentTypeId: "parent-id",
      toCommentTypeId: "child-id",
    });

    // Uncheck
    await checkboxLabel.click();
    await elem.updateComplete;

    // Verify path removed
    expect(elem.rule.commentTypePaths).toHaveLength(0);
  });
});
