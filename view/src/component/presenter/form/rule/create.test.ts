import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { CreateRuleFormPresenter } from "./create";

describe("CreateRuleFormPresenter", async () => {
  let elem: CreateRuleFormPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "create-rule-form-presenter"
    ) as CreateRuleFormPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("ルール名入力欄が表示されること", async () => {
    const input = page.getByLabelText("ルール名");
    await expect.element(input).toBeInTheDocument();
  });

  it("作成ボタンをクリックすると、createRule関数が呼び出されること", async () => {
    const createRule = vi.fn();
    elem.createRule = createRule;

    const button = page.getByRole("button", { name: "作成する" });
    await button.click();

    expect(createRule).toHaveBeenCalled();
  });
});
