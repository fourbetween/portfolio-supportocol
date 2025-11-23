import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
});
