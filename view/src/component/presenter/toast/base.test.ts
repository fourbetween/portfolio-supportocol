import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { BaseToastPresenter } from "./base";

describe("BaseToastPresenter", async () => {
  let elem: BaseToastPresenter;

  beforeEach(() => {
    vi.useFakeTimers();
    elem = document.createElement("base-toast-presenter") as BaseToastPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    vi.useRealTimers();
    elem.remove();
  });

  it("show()メソッドを呼ぶとトーストが表示されること", async () => {
    elem.show({ message: "テストメッセージ", type: "success" });
    await expect.element(page.getByRole("alert")).toBeVisible();
  });

  it("メッセージが正しく表示されること", async () => {
    elem.show({ message: "成功しました", type: "success" });
    await expect.element(page.getByText("成功しました")).toBeVisible();
  });

  it("一定時間後にトーストが非表示になること", async () => {
    elem.show({ message: "テストメッセージ", type: "success", duration: 3000 });
    await expect.element(page.getByRole("alert")).toBeVisible();
    vi.advanceTimersByTime(3000);
    await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
  });

  it("閉じるボタンをクリックするとトーストが非表示になること", async () => {
    vi.useRealTimers();
    elem.show({ message: "テストメッセージ", type: "success" });
    await expect.element(page.getByRole("alert")).toBeVisible();
    await page.getByRole("button", { name: "閉じる" }).click();
    await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
  });

  it("successタイプのトーストが正しく表示されること", async () => {
    elem.show({ message: "成功しました", type: "success" });
    const toast = page.getByRole("alert");
    await expect.element(toast).toBeVisible();
    await expect.element(toast).toHaveClass("success");
  });

  it("errorタイプのトーストが正しく表示されること", async () => {
    elem.show({ message: "エラーが発生しました", type: "error" });
    const toast = page.getByRole("alert");
    await expect.element(toast).toBeVisible();
    await expect.element(toast).toHaveClass("error");
  });
});
