import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import "./discussion-add-form";

describe("learning-discussion-add-form", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("テーマを入力して追加ボタンを押したときに onSubmit が呼ばれること", async () => {
    const onSubmit = vi.fn();
    render(
      html`
        <learning-discussion-add-form
          .onSubmit=${onSubmit}
        ></learning-discussion-add-form>
      `,
      container
    );

    const input = page.getByPlaceholder("New discussion theme");
    await input.fill("新しい議論");

    await page.getByRole("button", { name: "add" }).click();

    expect(onSubmit).toHaveBeenCalledWith("新しい議論");
  });

  it("ボタンにアイコンが表示されていること", async () => {
    render(
      html`
        <learning-discussion-add-form></learning-discussion-add-form>
      `,
      container
    );

    const button = page.getByRole("button", { name: "add" });
    await expect.element(button).toBeVisible();

    const element = button.element();
    const icon = element.querySelector(".material-symbols-outlined");
    expect(icon).not.toBeNull();
    expect(icon?.textContent).toBe("add");
  });
});
