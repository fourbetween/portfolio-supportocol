import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import "./discussion-status-popup";

describe("learning-discussion-status-popup", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("open属性がtrueのとき、ダイアログが表示されること", async () => {
    render(
      html`
        <learning-discussion-status-popup
          .open=${true}
        ></learning-discussion-status-popup>
      `,
      container
    );

    const dialog = page.getByRole("dialog");
    await expect.element(dialog).toBeVisible();
    await expect
      .element(page.getByText("Do you want to publish this discussion?"))
      .toBeVisible();
  });

  it("公開ボタンをクリックしたときに learning-discussion-update-status イベントが発火されること", async () => {
    const onUpdateStatus = vi.fn();
    render(
      html`
        <learning-discussion-status-popup
          .open=${true}
          @learning-discussion-update-status=${(e: any) =>
            onUpdateStatus(e.status)}
        ></learning-discussion-status-popup>
      `,
      container
    );

    const publishButton = page.getByRole("button", { name: "Publish" });
    await publishButton.click();

    expect(onUpdateStatus).toHaveBeenCalledWith("public");
  });

  it("非公開ボタンをクリックしたときに learning-discussion-update-status イベントが発火されること", async () => {
    const onUpdateStatus = vi.fn();
    render(
      html`
        <learning-discussion-status-popup
          .open=${true}
          .status=${"public"}
          @learning-discussion-update-status=${(e: any) =>
            onUpdateStatus(e.status)}
        ></learning-discussion-status-popup>
      `,
      container
    );

    const unpublishButton = page.getByRole("button", { name: "Unpublish" });
    await unpublishButton.click();

    expect(onUpdateStatus).toHaveBeenCalledWith("private");
  });

  it("キャンセルボタンをクリックしたときに open が false になること", async () => {
    render(
      html`
        <learning-discussion-status-popup
          .open=${true}
        ></learning-discussion-status-popup>
      `,
      container
    );

    const cancelButton = page.getByRole("button", { name: "Cancel" });
    await cancelButton.click();

    const element = document.querySelector(
      "learning-discussion-status-popup"
    ) as any;
    expect(element.open).toBe(false);
  });
});
