import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { HomePagePresenter } from "./home";

describe("HomePagePresenter", async () => {
  let elem: HomePagePresenter;

  beforeEach(() => {
    elem = document.createElement("home-page-presenter") as HomePagePresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("アプリのタイトルが表示されること", async () => {
    await expect
      .element(page.getByRole("heading", { level: 1 }))
      .toHaveTextContent("Supportocol");
  });

  it("アプリの説明が表示されること", async () => {
    await expect
      .element(page.getByText("論理的な議論を支援するプラットフォーム"))
      .toBeVisible();
  });

  it("ログインボタンが表示されること", async () => {
    await expect
      .element(page.getByRole("button", { name: "ログイン" }))
      .toBeVisible();
  });

  it("公開議論一覧へのリンクが表示されること", async () => {
    await expect
      .element(page.getByRole("link", { name: "公開議論を見る" }))
      .toBeVisible();
  });

  it("ログインボタンをクリックするとonLoginが呼び出されること", async () => {
    const onLogin = vi.fn();
    elem.onLogin = onLogin;
    await page.getByRole("button", { name: "ログイン" }).click();
    expect(onLogin).toHaveBeenCalled();
  });
});
