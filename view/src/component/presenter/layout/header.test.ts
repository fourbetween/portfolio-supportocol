import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { HeaderPresenter } from "./header";

describe("HeaderPresenter", async () => {
  let elem: HeaderPresenter;

  beforeEach(() => {
    elem = document.createElement("header-presenter") as HeaderPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("サイトタイトルが表示されること", async () => {
    await expect.element(page.getByText("Supportocol")).toBeInTheDocument();
  });

  it("ダッシュボードへのリンクが存在すること", async () => {
    await expect
      .element(page.getByRole("link", { name: "ダッシュボード" }))
      .toBeInTheDocument();
  });

  it("ルール一覧へのリンクが存在すること", async () => {
    await expect
      .element(page.getByRole("link", { name: "ルール" }))
      .toBeInTheDocument();
  });

  it("プロジェクト一覧へのリンクが存在すること", async () => {
    await expect
      .element(page.getByRole("link", { name: "プロジェクト" }))
      .toBeInTheDocument();
  });
});
