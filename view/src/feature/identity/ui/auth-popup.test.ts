import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./auth-popup";
import { IdentityAuthPopup } from "./auth-popup";

describe("identity-auth-popup", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("初期状態でログインモードが表示されること", async () => {
    render(
      html`
        <identity-auth-popup .selfSignupEnabled=${true}></identity-auth-popup>
      `,
      container
    );
    const el = container.querySelector(
      "identity-auth-popup"
    ) as IdentityAuthPopup;
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;

    await expect
      .element(page.getByText("Log in", { exact: true }).first())
      .toBeVisible();
    await expect
      .element(page.getByPlaceholder("Enter email address"))
      .toBeVisible();
    await expect.element(page.getByPlaceholder("Enter password")).toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "Log in" }))
      .toBeVisible();
  });

  it("サインアップモードに切り替えられること", async () => {
    render(
      html`
        <identity-auth-popup .selfSignupEnabled=${true}></identity-auth-popup>
      `,
      container
    );
    const el = container.querySelector(
      "identity-auth-popup"
    ) as IdentityAuthPopup;
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;

    const switchLink = page.getByText("Sign up");
    await switchLink.click();

    // SwitchModeEvent が発火されるはずだが、Presenter なので親が mode を更新することを期待する
    // ここでは手動で mode を変えて表示を確認する
    el.mode = "signup";
    await el.updateComplete;

    await expect
      .element(page.getByText("Sign up", { exact: true }).first())
      .toBeVisible();
    await expect
      .element(page.getByPlaceholder("Re-enter password"))
      .toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "Sign up" }))
      .toBeVisible();
  });

  it("バリデーションエラーが表示されること", async () => {
    render(
      html`
        <identity-auth-popup
          .mode=${"signup"}
          .selfSignupEnabled=${true}
        ></identity-auth-popup>
      `,
      container
    );
    const el = container.querySelector(
      "identity-auth-popup"
    ) as IdentityAuthPopup;
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;

    const emailInput = page.getByPlaceholder("Enter email address");
    const passwordInput = page.getByPlaceholder(
      "Enter password (8 or more characters)"
    );
    const confirmInput = page.getByPlaceholder("Re-enter password");
    const submitButton = page.getByRole("button", { name: "Sign up" });

    await emailInput.fill("test@example.com");
    await passwordInput.fill("Password123");
    await confirmInput.fill("Different123");
    await submitButton.click();

    await expect
      .element(page.getByText("Passwords do not match"))
      .toBeVisible();
  });
});
