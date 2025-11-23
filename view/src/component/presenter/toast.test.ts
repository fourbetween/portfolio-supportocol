import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ToastPresenter } from "./toast";

describe("ToastPresenter", async () => {
  let elem: ToastPresenter;

  beforeEach(() => {
    elem = document.createElement("toast-presenter") as unknown as ToastPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    (elem as unknown as HTMLElement).remove();
  });

  it("トーストコンテナが表示されること", async () => {
    await elem.updateComplete;
    const container = elem.shadowRoot?.querySelector(".toast-container");
    expect(container).not.toBeNull();
  });

  it("show()メソッドでトーストが表示されること", async () => {
    elem.show("テストメッセージ", "info");
    await elem.updateComplete;

    const toast = elem.shadowRoot?.querySelector(".toast");
    expect(toast).not.toBeNull();
    expect(toast?.textContent).toContain("テストメッセージ");
  });

  it("各タイプのトーストが表示されること", async () => {
    elem.show("成功", "success");
    elem.show("エラー", "error");
    elem.show("警告", "warning");
    elem.show("情報", "info");
    await elem.updateComplete;

    const toasts = elem.shadowRoot?.querySelectorAll(".toast");
    expect(toasts?.length).toBe(4);

    expect(
      elem.shadowRoot?.querySelector(".toast-success")
    ).not.toBeNull();
    expect(elem.shadowRoot?.querySelector(".toast-error")).not.toBeNull();
    expect(
      elem.shadowRoot?.querySelector(".toast-warning")
    ).not.toBeNull();
    expect(elem.shadowRoot?.querySelector(".toast-info")).not.toBeNull();
  });

  it("閉じるボタンでトーストが削除されること", async () => {
    elem.show("テストメッセージ", "info");
    await elem.updateComplete;

    const closeButton = elem.shadowRoot?.querySelector(
      ".toast-close"
    ) as HTMLButtonElement;
    expect(closeButton).not.toBeNull();

    closeButton.click();
    await elem.updateComplete;

    const toast = elem.shadowRoot?.querySelector(".toast");
    expect(toast).toBeNull();
  });

  it("時間経過後にトーストが自動削除されること", async () => {
    vi.useFakeTimers();

    elem.show("テストメッセージ", "info", 1000);
    await elem.updateComplete;

    let toast = elem.shadowRoot?.querySelector(".toast");
    expect(toast).not.toBeNull();

    vi.advanceTimersByTime(1000);
    await elem.updateComplete;

    toast = elem.shadowRoot?.querySelector(".toast");
    expect(toast).toBeNull();

    vi.useRealTimers();
  });

  it("複数のトーストが表示されること", async () => {
    elem.show("メッセージ1", "success");
    elem.show("メッセージ2", "error");
    elem.show("メッセージ3", "info");
    await elem.updateComplete;

    const toasts = elem.shadowRoot?.querySelectorAll(".toast");
    expect(toasts?.length).toBe(3);
  });

  it("各トーストにアイコンが表示されること", async () => {
    elem.show("テスト", "success");
    await elem.updateComplete;

    const icon = elem.shadowRoot?.querySelector(".toast-icon");
    expect(icon).not.toBeNull();
    expect(icon?.tagName.toLowerCase()).toBe("svg");
  });

  it("デフォルトの表示時間が設定されていること", async () => {
    expect(elem.defaultDuration).toBe(5000);
  });

  it("カスタム表示時間でトーストが表示されること", async () => {
    vi.useFakeTimers();

    elem.show("テストメッセージ", "info", 2000);
    await elem.updateComplete;

    let toast = elem.shadowRoot?.querySelector(".toast");
    expect(toast).not.toBeNull();

    vi.advanceTimersByTime(1999);
    await elem.updateComplete;
    toast = elem.shadowRoot?.querySelector(".toast");
    expect(toast).not.toBeNull();

    vi.advanceTimersByTime(1);
    await elem.updateComplete;
    toast = elem.shadowRoot?.querySelector(".toast");
    expect(toast).toBeNull();

    vi.useRealTimers();
  });
});
