import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "./comment-edit-form";
import type { LearningCommentEditForm } from "./comment-edit-form";

describe("learning-comment-edit-form", async () => {
  let elem: LearningCommentEditForm;

  beforeEach(() => {
    elem = document.createElement(
      "learning-comment-edit-form"
    ) as LearningCommentEditForm;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("is defined", async () => {
    expect(customElements.get("learning-comment-edit-form")).toBeDefined();
    expect(elem).toBeInstanceOf(HTMLElement);
  });

  it("renders initialType and initialContent", async () => {
    elem.initialType = "質問";
    elem.initialContent = "これは質問です";
    await elem.updateComplete;

    const badge = elem.shadowRoot?.querySelector("learning-comment-type-badge");
    const textarea = elem.shadowRoot?.querySelector("textarea");

    expect(badge).not.toBeNull();
    expect((badge as any).type).toBe("質問");
    expect(textarea).not.toBeNull();
    expect(textarea?.value).toBe("これは質問です");
  });

  it("renders save and cancel buttons with icons and titles", async () => {
    const saveButton = elem.shadowRoot?.querySelector(".save-button");
    const cancelButton = elem.shadowRoot?.querySelector(".cancel-button");

    expect(saveButton).not.toBeNull();
    expect(saveButton?.getAttribute("title")).toBe("Save");
    expect(
      saveButton?.querySelector(".material-symbols-outlined")?.textContent
    ).toBe("save");

    expect(cancelButton).not.toBeNull();
    expect(cancelButton?.getAttribute("title")).toBe("Cancel");
    expect(
      cancelButton?.querySelector(".material-symbols-outlined")?.textContent
    ).toBe("close");
  });

  it("calls onSave callback with content", async () => {
    let savedContent = "";
    elem.onSave = (detail) => {
      savedContent = detail.content;
    };

    const textarea = elem.shadowRoot?.querySelector("textarea");
    if (textarea) {
      textarea.value = "新しいコメント";
      textarea.dispatchEvent(new Event("input"));
    }

    const saveButton = elem.shadowRoot?.querySelector(
      ".save-button"
    ) as HTMLElement;
    saveButton.click();

    expect(savedContent).toBe("新しいコメント");
  });

  it("calls onCancel callback", async () => {
    let cancelled = false;
    elem.onCancel = () => {
      cancelled = true;
    };

    const cancelButton = elem.shadowRoot?.querySelector(
      ".cancel-button"
    ) as HTMLElement;
    cancelButton.click();

    expect(cancelled).toBe(true);
  });

  it("opens popup on badge click and updates type on select", async () => {
    elem.availableTypes = ["質問", "回答", "アイデア"];
    elem.initialType = "質問";
    await elem.updateComplete;

    const badge = elem.shadowRoot?.querySelector(
      "learning-comment-type-badge"
    ) as HTMLElement;
    const popup = elem.shadowRoot?.querySelector(
      "learning-comment-type-popup"
    ) as any;

    // Mock popup open
    let popupOpened = false;
    popup.open = () => {
      popupOpened = true;
    };

    badge.click();
    expect(popupOpened).toBe(true);

    // Simulate selection
    popup.onSelect("回答");
    await elem.updateComplete;

    const badgeAfter = elem.shadowRoot?.querySelector(
      "learning-comment-type-badge"
    ) as any;
    expect(badgeAfter.type).toBe("回答");
  });

  it("has styled textarea and buttons", async () => {
    const textarea = elem.shadowRoot?.querySelector("textarea");
    const saveButton = elem.shadowRoot?.querySelector(".save-button");
    const cancelButton = elem.shadowRoot?.querySelector(".cancel-button");

    expect(textarea).not.toBeNull();
    expect(saveButton).not.toBeNull();
    expect(cancelButton).not.toBeNull();

    // These might fail if not yet styled
    const textareaStyle = window.getComputedStyle(textarea!);
    expect(textareaStyle.borderRadius).not.toBe("0px");
    expect(textareaStyle.borderStyle).toBe("solid");

    expect(saveButton?.classList.contains("btn")).toBe(true);
    expect(saveButton?.classList.contains("btn-primary")).toBe(true);
    expect(cancelButton?.classList.contains("btn")).toBe(true);
  });
});
