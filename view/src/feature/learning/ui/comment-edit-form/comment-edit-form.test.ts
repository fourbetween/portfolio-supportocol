import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./comment-edit-form";

describe("learning-comment-edit-form", async () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("is defined", async () => {
    render(
      html`
        <learning-comment-edit-form></learning-comment-edit-form>
      `,
      container
    );
    const elem = container.querySelector("learning-comment-edit-form");
    expect(customElements.get("learning-comment-edit-form")).toBeDefined();
    expect(elem).toBeInstanceOf(HTMLElement);
  });

  it("renders initialType and initialContent", async () => {
    render(
      html`
        <learning-comment-edit-form
          .initialType=${"質問"}
          .initialContent=${"これは質問です"}
        ></learning-comment-edit-form>
      `,
      container
    );

    await expect
      .element(page.getByRole("textbox"))
      .toHaveValue("これは質問です");
    await expect.element(page.getByText("質問").first()).toBeVisible();
  });

  it("renders save and cancel buttons with icons and titles", async () => {
    render(
      html`
        <learning-comment-edit-form></learning-comment-edit-form>
      `,
      container
    );
    await expect.element(page.getByTitle("Save")).toBeVisible();
    await expect.element(page.getByTitle("Cancel")).toBeVisible();
  });

  it("calls onSave callback with content", async () => {
    let savedContent = "";
    const onSave = (detail: { commentType: string; content: string }) => {
      savedContent = detail.content;
    };

    render(
      html`
        <learning-comment-edit-form
          .onSave=${onSave}
        ></learning-comment-edit-form>
      `,
      container
    );

    const textarea = page.getByPlaceholder("Enter your comment...");
    await textarea.fill("新しいコメント");

    const saveButton = page.getByTitle("Save");
    await saveButton.click();

    expect(savedContent).toBe("新しいコメント");
  });

  it("calls onCancel callback", async () => {
    let cancelled = false;
    const onCancel = () => {
      cancelled = true;
    };

    render(
      html`
        <learning-comment-edit-form
          .onCancel=${onCancel}
        ></learning-comment-edit-form>
      `,
      container
    );

    const cancelButton = page.getByTitle("Cancel");
    await cancelButton.click();

    expect(cancelled).toBe(true);
  });

  it("opens popup on badge click and updates type on select", async () => {
    render(
      html`
        <learning-comment-edit-form
          .availableTypes=${["質問", "回答", "アイデア"]}
          .initialType=${"質問"}
        ></learning-comment-edit-form>
      `,
      container
    );

    // Badge click
    const badge = page.getByText("質問").first();
    await badge.click();

    // Popup should be open.
    const option = page.getByRole("button", { name: "回答" });
    await option.click();

    // Badge should now show "回答"
    await expect.element(page.getByText("回答").first()).toBeVisible();
  });

  it("has styled textarea and buttons", async () => {
    render(
      html`
        <learning-comment-edit-form></learning-comment-edit-form>
      `,
      container
    );

    const textarea = page.getByPlaceholder("Enter your comment...");
    const saveButton = page.getByTitle("Save");
    const cancelButton = page.getByTitle("Cancel");

    await expect.element(textarea).toBeVisible();
    await expect.element(saveButton).toBeVisible();
    await expect.element(cancelButton).toBeVisible();
  });
});
