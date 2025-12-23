import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { BaseLoadingPresenter } from "./base";

describe("BaseLoadingPresenter", async () => {
  let elem: BaseLoadingPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "base-loading-presenter"
    ) as BaseLoadingPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("showがtrueのときにローディングが表示されること", async () => {
    elem.show = true;
    await expect.element(page.getByRole("status")).toBeVisible();
  });

  it("progressが未指定のときにスピナーが表示されること", async () => {
    elem.show = true;
    elem.progress = undefined;
    await expect.element(page.getByTestId("spinner")).toBeVisible();
  });

  it("progressが指定されたときにプログレスバーが表示されること", async () => {
    elem.show = true;
    elem.progress = 50;
    await expect.element(page.getByRole("progressbar")).toBeVisible();
    await expect.element(page.getByText("50%")).toBeVisible();
  });
});
