import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import "./discussion-publish-popup";

describe("learning-discussion-publish-popup", () => {
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
        <learning-discussion-publish-popup
          .open=${true}
        ></learning-discussion-publish-popup>
      `,
      container
    );

    const dialog = page.getByRole("dialog");
    await expect.element(dialog).toBeVisible();
    await expect
      .element(page.getByText("Do you want to publish this discussion?"))
      .toBeVisible();
  });

  it("公開ボタンをクリックしたときに learning-discussion-publish イベントが発火されること", async () => {
    const onPublish = vi.fn();
    render(
      html`
        <learning-discussion-publish-popup
          .open=${true}
          @learning-discussion-publish=${() => onPublish()}
        ></learning-discussion-publish-popup>
      `,
      container
    );

    const publishButton = page.getByRole("button", { name: "Publish" });
    await publishButton.click();

    expect(onPublish).toHaveBeenCalled();
  });

  it("キャンセルボタンをクリックしたときに open が false になること", async () => {
    render(
      html`
        <learning-discussion-publish-popup
          .open=${true}
        ></learning-discussion-publish-popup>
      `,
      container
    );

    const cancelButton = page.getByRole("button", { name: "Cancel" });
    await cancelButton.click();

    const element = document.querySelector(
      "learning-discussion-publish-popup"
    ) as any;
    expect(element.open).toBe(false);
  });
});
