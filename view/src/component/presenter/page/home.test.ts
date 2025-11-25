import { type Mock, describe, expect, it, vi } from "vitest";

describe("HomePagePresenter", () => {
  it("アプリ概要を表示すること", async () => {
    const el = document.createElement("home-page-presenter");
    document.body.appendChild(el);

    await el.updateComplete;

    const appTitle = el.shadowRoot?.querySelector(".app-title");
    expect(appTitle).not.toBeNull();
    expect(appTitle?.textContent).toContain("Supportocol");

    const appDescription = el.shadowRoot?.querySelector(".app-description");
    expect(appDescription).not.toBeNull();
    expect(appDescription?.textContent).toContain("論理的な議論");

    document.body.removeChild(el);
  });

  it("ログインボタンを表示すること", async () => {
    const el = document.createElement("home-page-presenter");
    document.body.appendChild(el);

    await el.updateComplete;

    const loginButton = el.shadowRoot?.querySelector(".login-button");
    expect(loginButton).not.toBeNull();
    expect(loginButton?.textContent).toContain("ログイン");

    document.body.removeChild(el);
  });

  it("公開議論一覧へのリンクを表示すること", async () => {
    const el = document.createElement("home-page-presenter");
    document.body.appendChild(el);

    await el.updateComplete;

    const discussionsLink = el.shadowRoot?.querySelector(".discussions-link");
    expect(discussionsLink).not.toBeNull();
    expect(discussionsLink?.getAttribute("href")).toBe("/discussions");
    expect(discussionsLink?.textContent).toContain("公開議論一覧");

    document.body.removeChild(el);
  });

  it("ログインボタンをクリックするとonLoginCallbackが呼ばれること", async () => {
    const el = document.createElement("home-page-presenter");
    const onLoginCallback: Mock = vi.fn();
    (el as unknown as { onLoginCallback: Mock }).onLoginCallback =
      onLoginCallback;
    document.body.appendChild(el);

    await el.updateComplete;

    const loginButton =
      el.shadowRoot?.querySelector<HTMLButtonElement>(".login-button");
    loginButton?.click();

    expect(onLoginCallback).toHaveBeenCalledOnce();

    document.body.removeChild(el);
  });
});
