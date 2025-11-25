import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { MainHeaderPresenter } from "./main";

describe("MainHeaderPresenter", async () => {
  let elem: MainHeaderPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "main-header-presenter"
    ) as MainHeaderPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("ロゴが表示されること", async () => {
    await expect.element(page.getByText("Supportocol")).toBeInTheDocument();
  });

  it("ナビゲーションリンクが表示されること", async () => {
    await expect.element(page.getByText("ダッシュボード")).toBeInTheDocument();
    await expect.element(page.getByText("プロジェクト")).toBeInTheDocument();
    await expect.element(page.getByText("議論")).toBeInTheDocument();
    await expect.element(page.getByText("ルール")).toBeInTheDocument();
  });

  it("ヘッダーの背景色がGitHubのヘッダー色であること", async () => {
    const header = elem.shadowRoot?.querySelector(".header");
    const style = window.getComputedStyle(header!);
    expect(style.backgroundColor).toBe("rgb(36, 41, 47)");
  });
});
