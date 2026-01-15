import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { POPUP_CLOSED_EVENT_NAME } from "../../event/popup";
import "./popup";

describe("ui-popup", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("footerに内容がある場合、footerが表示されること", async () => {
    render(
      html`
        <ui-popup .open=${true}>
          <div slot="footer">Footer Content</div>
        </ui-popup>
      `,
      container
    );
    // slotchange の反映を待つ
    await new Promise((resolve) => setTimeout(resolve, 100));
    await expect.element(page.getByText("Footer Content")).toBeVisible();
  });

  it("openプロパティをtrueにすると、ダイアログが表示されること", async () => {
    render(
      html`
        <ui-popup .open=${true}>
          <div slot="main">Main Content</div>
        </ui-popup>
      `,
      container
    );
    await expect.element(page.getByText("Main Content")).toBeVisible();
    await expect.element(page.getByRole("dialog")).toHaveAttribute("open");
  });

  it("openプロパティをfalseにすると、ダイアログが閉じられること", async () => {
    render(
      html`
        <ui-popup .open=${true}>
          <div slot="main">Main Content</div>
        </ui-popup>
      `,
      container
    );
    await expect.element(page.getByRole("dialog")).toHaveAttribute("open");

    render(
      html`
        <ui-popup .open=${false}>
          <div slot="main">Main Content</div>
        </ui-popup>
      `,
      container
    );
    // 閉じている状態では getByRole("dialog") が見つからない可能性があるため includeHidden を使用
    await expect
      .element(page.getByRole("dialog", { includeHidden: true }))
      .not.toHaveAttribute("open");
  });

  it("閉じるボタンをクリックするとダイアログが閉じられること", async () => {
    render(
      html`
        <ui-popup .open=${true}></ui-popup>
      `,
      container
    );
    await expect.element(page.getByRole("dialog")).toHaveAttribute("open");

    const closeButton = page.getByRole("button", { name: "Close" });
    await closeButton.click();

    await expect
      .element(page.getByRole("dialog", { includeHidden: true }))
      .not.toHaveAttribute("open");
  });

  it("ダイアログを閉じるとpopup-closedイベントが発火すること", async () => {
    render(
      html`
        <ui-popup .open=${true}></ui-popup>
      `,
      container
    );
    const popup = container.querySelector("ui-popup")!;
    const handler = vi.fn();
    popup.addEventListener(POPUP_CLOSED_EVENT_NAME, handler);

    const closeButton = page.getByRole("button", { name: "Close" });
    await closeButton.click();

    expect(handler).toHaveBeenCalled();
  });
});
