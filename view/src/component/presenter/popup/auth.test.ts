import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthPopupPresenter } from "./auth";

describe("AuthPopupPresenter", async () => {
  let elem: AuthPopupPresenter;

  beforeEach(() => {
    elem = document.createElement("auth-popup-presenter") as AuthPopupPresenter;
    elem.selfSignupEnabled = true;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("selfSignupEnabledの初期値がfalseであること", async () => {
    const newElem = document.createElement(
      "auth-popup-presenter"
    ) as AuthPopupPresenter;
    document.body.appendChild(newElem);
    await newElem.updateComplete;
    expect(newElem.selfSignupEnabled).toBe(false);
    newElem.remove();
  });

  it("base-popup-presenterが表示されること", async () => {
    await elem.updateComplete;
    const basePopup = elem.renderRoot.querySelector("base-popup-presenter");
    expect(basePopup).not.toBeNull();
  });

  it("ログインモードでログインタイトルが表示されること", async () => {
    elem.mode = "login";
    await elem.updateComplete;
    const title = elem.renderRoot.querySelector(".popup-title");
    expect(title).not.toBeNull();
    expect(title?.textContent?.trim()).toBe("ログイン");
  });

  it("ログインモードでメールアドレス入力欄が表示されること", async () => {
    elem.mode = "login";
    await elem.updateComplete;
    const emailInput = elem.renderRoot.querySelector('input[name="email"]');
    expect(emailInput).not.toBeNull();
    expect(emailInput?.getAttribute("type")).toBe("email");
  });

  it("ログインモードでパスワード入力欄が表示されること", async () => {
    elem.mode = "login";
    await elem.updateComplete;
    const passwordInput = elem.renderRoot.querySelector(
      'input[name="password"]'
    );
    expect(passwordInput).not.toBeNull();
    expect(passwordInput?.getAttribute("type")).toBe("password");
  });

  it("ログインモードでログインボタンが表示されること", async () => {
    elem.mode = "login";
    await elem.updateComplete;
    const loginButton = elem.renderRoot.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    expect(loginButton).not.toBeNull();
    expect(loginButton?.textContent?.trim()).toBe("ログイン");
  });

  it("新規登録モードで新規登録タイトルが表示されること", async () => {
    elem.mode = "signup";
    await elem.updateComplete;
    const title = elem.renderRoot.querySelector(".popup-title");
    expect(title).not.toBeNull();
    expect(title?.textContent?.trim()).toBe("新規登録");
  });

  it("新規登録モードでパスワード確認入力欄が表示されること", async () => {
    elem.mode = "signup";
    await elem.updateComplete;
    const confirmInput = elem.renderRoot.querySelector(
      'input[name="passwordConfirm"]'
    );
    expect(confirmInput).not.toBeNull();
    expect(confirmInput?.getAttribute("type")).toBe("password");
  });

  it("新規登録モードで新規登録ボタンが表示されること", async () => {
    elem.mode = "signup";
    await elem.updateComplete;
    const signupButton = elem.renderRoot.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    expect(signupButton).not.toBeNull();
    expect(signupButton?.textContent?.trim()).toBe("新規登録");
  });

  it("ログインモードで新規登録リンクが表示されること", async () => {
    elem.mode = "login";
    elem.selfSignupEnabled = true;
    await elem.updateComplete;
    const switchLink = elem.renderRoot.querySelector(".switch-link");
    expect(switchLink).not.toBeNull();
    expect(switchLink?.textContent?.trim()).toBe("新規登録");
  });

  it("新規登録モードでログインリンクが表示されること", async () => {
    elem.mode = "signup";
    await elem.updateComplete;
    const switchLink = elem.renderRoot.querySelector(".switch-link");
    expect(switchLink).not.toBeNull();
    expect(switchLink?.textContent?.trim()).toBe("ログイン");
  });

  it("ログインモードで新規登録リンクをクリックするとonSwitchModeが呼ばれること", async () => {
    const onSwitchMode = vi.fn();
    elem.mode = "login";
    elem.selfSignupEnabled = true;
    elem.onSwitchMode = onSwitchMode;
    await elem.updateComplete;

    const switchLink = elem.renderRoot.querySelector(
      ".switch-link"
    ) as HTMLAnchorElement;
    switchLink.click();

    expect(onSwitchMode).toHaveBeenCalledWith("signup");
  });

  it("閉じるボタンが表示されること", async () => {
    await elem.updateComplete;
    const basePopup = elem.renderRoot.querySelector("base-popup-presenter");
    const closeButton = basePopup?.shadowRoot?.querySelector(".close-button");
    expect(closeButton).not.toBeNull();
  });

  it("ログインモードでフォーム送信するとonLoginが呼ばれること", async () => {
    const onLogin = vi.fn();
    elem.mode = "login";
    elem.onLogin = onLogin;
    await elem.updateComplete;

    const emailInput = elem.renderRoot.querySelector(
      'input[name="email"]'
    ) as HTMLInputElement;
    const passwordInput = elem.renderRoot.querySelector(
      'input[name="password"]'
    ) as HTMLInputElement;
    emailInput.value = "test@example.com";
    passwordInput.value = "password123";

    const form = elem.renderRoot.querySelector("form") as HTMLFormElement;
    form.dispatchEvent(new Event("submit", { cancelable: true }));

    expect(onLogin).toHaveBeenCalledWith("test@example.com", "password123");
  });

  it("新規登録モードでフォーム送信するとonSignupが呼ばれること", async () => {
    const onSignup = vi.fn();
    elem.mode = "signup";
    elem.onSignup = onSignup;
    await elem.updateComplete;

    const emailInput = elem.renderRoot.querySelector(
      'input[name="email"]'
    ) as HTMLInputElement;
    const passwordInput = elem.renderRoot.querySelector(
      'input[name="password"]'
    ) as HTMLInputElement;
    const confirmInput = elem.renderRoot.querySelector(
      'input[name="passwordConfirm"]'
    ) as HTMLInputElement;
    emailInput.value = "test@example.com";
    passwordInput.value = "Password123";
    confirmInput.value = "Password123";

    const form = elem.renderRoot.querySelector("form") as HTMLFormElement;
    form.dispatchEvent(new Event("submit", { cancelable: true }));

    expect(onSignup).toHaveBeenCalledWith("test@example.com", "Password123");
  });

  it("新規登録モードでパスワードが一致しない場合エラーメッセージが表示されること", async () => {
    const onSignup = vi.fn();
    elem.mode = "signup";
    elem.onSignup = onSignup;
    await elem.updateComplete;

    const emailInput = elem.renderRoot.querySelector(
      'input[name="email"]'
    ) as HTMLInputElement;
    const passwordInput = elem.renderRoot.querySelector(
      'input[name="password"]'
    ) as HTMLInputElement;
    const confirmInput = elem.renderRoot.querySelector(
      'input[name="passwordConfirm"]'
    ) as HTMLInputElement;
    emailInput.value = "test@example.com";
    passwordInput.value = "password123";
    confirmInput.value = "different123";

    const form = elem.renderRoot.querySelector("form") as HTMLFormElement;
    form.dispatchEvent(new Event("submit", { cancelable: true }));

    await elem.updateComplete;

    const errorMessage = elem.renderRoot.querySelector(".error-message");
    expect(errorMessage).not.toBeNull();
    expect(errorMessage?.textContent?.trim()).toBe("パスワードが一致しません");
    expect(onSignup).not.toHaveBeenCalled();
  });

  it("外部から渡されたエラーメッセージが表示されること", async () => {
    elem.errorMessage = "メールアドレスまたはパスワードが正しくありません";
    await elem.updateComplete;

    const errorMessage = elem.renderRoot.querySelector(".error-message");
    expect(errorMessage).not.toBeNull();
    expect(errorMessage?.textContent?.trim()).toBe(
      "メールアドレスまたはパスワードが正しくありません"
    );
  });

  it("Googleログインボタン用のコンテナが表示されること", async () => {
    await elem.updateComplete;
    const container = elem.googleButtonContainer;
    expect(container).not.toBeNull();
  });

  it("openメソッドを呼び出すとダイアログが開くこと", async () => {
    await elem.updateComplete;
    expect(() => elem.open()).not.toThrow();
  });

  it("ダイアログの幅がコンテンツに合わせて制限されること", async () => {
    await elem.updateComplete;
    const basePopup = elem.renderRoot.querySelector("base-popup-presenter");
    expect(basePopup).not.toBeNull();
    const styles = window.getComputedStyle(basePopup!);
    expect(styles.getPropertyValue("--popup-max-width")).toBe("400px");
  });

  it("新規登録モードでパスワードに小文字が含まれていない場合、エラーメッセージが表示され、onSignupが呼ばれないこと", async () => {
    elem.mode = "signup";
    const onSignup = vi.fn();
    elem.onSignup = onSignup;
    await elem.updateComplete;

    const emailInput = elem.renderRoot.querySelector(
      'input[name="email"]'
    ) as HTMLInputElement;
    emailInput.value = "test@example.com";

    const passwordInput = elem.renderRoot.querySelector(
      'input[name="password"]'
    ) as HTMLInputElement;
    passwordInput.value = "PASSWORD123"; // 小文字なし

    const confirmInput = elem.renderRoot.querySelector(
      'input[name="passwordConfirm"]'
    ) as HTMLInputElement;
    confirmInput.value = "PASSWORD123";

    const form = elem.renderRoot.querySelector("form") as HTMLFormElement;
    form.dispatchEvent(new Event("submit"));
    await elem.updateComplete;

    const errorMessage = elem.renderRoot.querySelector(".error-message");
    expect(errorMessage).not.toBeNull();
    expect(errorMessage?.textContent).toContain(
      "パスワードには小文字、大文字、数字を含める必要があります"
    );
    expect(onSignup).not.toHaveBeenCalled();
  });

  it("新規登録モードでパスワードに大文字が含まれていない場合、エラーメッセージが表示され、onSignupが呼ばれないこと", async () => {
    elem.mode = "signup";
    const onSignup = vi.fn();
    elem.onSignup = onSignup;
    await elem.updateComplete;

    const emailInput = elem.renderRoot.querySelector(
      'input[name="email"]'
    ) as HTMLInputElement;
    emailInput.value = "test@example.com";

    const passwordInput = elem.renderRoot.querySelector(
      'input[name="password"]'
    ) as HTMLInputElement;
    passwordInput.value = "password123"; // 大文字なし

    const confirmInput = elem.renderRoot.querySelector(
      'input[name="passwordConfirm"]'
    ) as HTMLInputElement;
    confirmInput.value = "password123";

    const form = elem.renderRoot.querySelector("form") as HTMLFormElement;
    form.dispatchEvent(new Event("submit"));
    await elem.updateComplete;

    const errorMessage = elem.renderRoot.querySelector(".error-message");
    expect(errorMessage).not.toBeNull();
    expect(errorMessage?.textContent).toContain(
      "パスワードには小文字、大文字、数字を含める必要があります"
    );
    expect(onSignup).not.toHaveBeenCalled();
  });

  it("新規登録モードでパスワードに数字が含まれていない場合、エラーメッセージが表示され、onSignupが呼ばれないこと", async () => {
    elem.mode = "signup";
    const onSignup = vi.fn();
    elem.onSignup = onSignup;
    await elem.updateComplete;

    const emailInput = elem.renderRoot.querySelector(
      'input[name="email"]'
    ) as HTMLInputElement;
    emailInput.value = "test@example.com";

    const passwordInput = elem.renderRoot.querySelector(
      'input[name="password"]'
    ) as HTMLInputElement;
    passwordInput.value = "Password"; // 数字なし

    const confirmInput = elem.renderRoot.querySelector(
      'input[name="passwordConfirm"]'
    ) as HTMLInputElement;
    confirmInput.value = "Password";

    const form = elem.renderRoot.querySelector("form") as HTMLFormElement;
    form.dispatchEvent(new Event("submit"));
    await elem.updateComplete;

    const errorMessage = elem.renderRoot.querySelector(".error-message");
    expect(errorMessage).not.toBeNull();
    expect(errorMessage?.textContent).toContain(
      "パスワードには小文字、大文字、数字を含める必要があります"
    );
    expect(onSignup).not.toHaveBeenCalled();
  });

  it("selfSignupEnabledがfalseの場合、ログインモードで新規登録リンクが表示されないこと", async () => {
    elem.mode = "login";
    // @ts-ignore
    elem.selfSignupEnabled = false;
    await elem.updateComplete;
    const switchLink = elem.renderRoot.querySelector(".switch-link");
    expect(switchLink).toBeNull();
  });

  it("selfSignupEnabledがtrueのとき、フォームが表示されること", async () => {
    elem.selfSignupEnabled = true;
    await elem.updateComplete;

    const form = elem.renderRoot.querySelector(".auth-form");
    expect(form).not.toBeNull();

    const divider = elem.renderRoot.querySelector(".divider");
    expect(divider).not.toBeNull();

    const googleButtonContainer = elem.renderRoot.querySelector(
      ".google-button-container"
    );
    expect(googleButtonContainer).not.toBeNull();
  });

  it("selfSignupEnabledがfalseの場合、フォームが表示されないこと", async () => {
    elem.selfSignupEnabled = false;
    await elem.updateComplete;
    const form = elem.renderRoot.querySelector("form");
    expect(form).toBeNull();
  });
});
