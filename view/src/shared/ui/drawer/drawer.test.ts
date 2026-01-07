import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { DRAWER_CLOSE_EVENT_NAME } from "../../event/drawer";
import "./drawer";
import { Drawer } from "./drawer";

describe("ui-drawer", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("初期状態では非表示であり、open属性で表示が切り替わること", async () => {
    render(
      html`
        <ui-drawer></ui-drawer>
      `,
      container
    );
    const drawer = container.querySelector("ui-drawer") as Drawer;
    await drawer.updateComplete;

    const content = page.getByTestId("drawer-content");

    // 初期状態：非表示
    await expect.element(content).not.toBeVisible();

    // 表示
    drawer.open = true;
    await drawer.updateComplete;
    await expect.element(content).toBeVisible();

    // 再度非表示
    drawer.open = false;
    await drawer.updateComplete;
    await expect.element(content).not.toBeVisible();
  });

  it("閉じるボタンをクリックするとopenがfalseになること", async () => {
    render(
      html`
        <ui-drawer .open=${true}></ui-drawer>
      `,
      container
    );
    const drawer = container.querySelector("ui-drawer") as Drawer;
    await drawer.updateComplete;

    const closeButton = page.getByRole("button");
    await closeButton.click();

    await drawer.updateComplete;
    expect(drawer.open).toBe(false);
    await expect.element(page.getByTestId("drawer-content")).not.toBeVisible();
  });

  it("バックドロップをクリックすると閉じられること", async () => {
    render(
      html`
        <ui-drawer .open=${true}></ui-drawer>
      `,
      container
    );
    const drawer = container.querySelector("ui-drawer") as Drawer;
    await drawer.updateComplete;

    // 表示されるまで少し待つ（アニメーションの影響を考慮）
    await new Promise((resolve) => setTimeout(resolve, 100));

    // バックドロップをクリック（ドロワーコンテンツ(右側300px)を避けるため左側をクリック）
    const backdrop = page.getByTestId("drawer-backdrop");
    await backdrop.click({ position: { x: 10, y: 10 } });

    await drawer.updateComplete;
    expect(drawer.open).toBe(false);
  });

  it("閉じられるときにdrawer-closeイベントが発火すること", async () => {
    render(
      html`
        <ui-drawer .open=${true}></ui-drawer>
      `,
      container
    );
    const drawer = container.querySelector("ui-drawer") as Drawer;
    await drawer.updateComplete;

    const onClose = vi.fn();
    drawer.addEventListener(DRAWER_CLOSE_EVENT_NAME, onClose);

    const closeButton = page.getByRole("button");
    await closeButton.click();

    expect(onClose).toHaveBeenCalled();
  });

  it("placement属性で左右を切り替えられること", async () => {
    render(
      html`
        <ui-drawer .open=${true} placement="left"></ui-drawer>
      `,
      container
    );
    const drawer = container.querySelector("ui-drawer") as any;
    await drawer.updateComplete;

    const content = page.getByTestId("drawer-content");
    // leftクラスが付与されていることを確認（実装予定）
    await expect.element(content).toHaveClass("left");

    // rightに変更
    drawer.placement = "right";
    await drawer.updateComplete;
    await expect.element(content).toHaveClass("right");
    await expect.element(content).not.toHaveClass("left");
  });
});
