import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { SettingsDiscussionFormPresenter } from "./settings";

describe("SettingsDiscussionFormPresenter", () => {
  let elem: SettingsDiscussionFormPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "settings-discussion-form-presenter"
    ) as SettingsDiscussionFormPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("タイトルとして「議論設定」が表示されること", async () => {
    await expect.element(page.getByText("議論設定")).toBeInTheDocument();
  });

  it("基本設定セクションが表示されること", async () => {
    await expect.element(page.getByText("基本設定")).toBeInTheDocument();
    await expect.element(page.getByLabelText("テーマ")).toBeInTheDocument();
    await expect.element(page.getByLabelText("背景")).toBeInTheDocument();
  });

  it("アクセス設定セクションが表示されること", async () => {
    await expect.element(page.getByText("アクセス設定")).toBeInTheDocument();
    await expect.element(page.getByLabelText("公開レベル")).toBeInTheDocument();
    await expect
      .element(page.getByLabelText("コメント許可レベル"))
      .toBeInTheDocument();
  });

  it("Danger Zoneが表示されること", async () => {
    await expect.element(page.getByText("Danger Zone")).toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "アーカイブ" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "削除" }))
      .toBeInTheDocument();
  });
});
