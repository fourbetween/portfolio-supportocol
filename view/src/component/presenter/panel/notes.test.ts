import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { Note } from "../../../model/discussion";
import type { NotesPanelPresenter } from "./notes";

describe("NotesPanelPresenter", async () => {
  let elem: NotesPanelPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "notes-panel-presenter"
    ) as NotesPanelPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  const mockNotes: Note[] = [
    {
      id: "01234567890123456789012370",
      discussionId: "01234567890123456789012348",
      content: "これはテストノート1です",
      postedBy: "01234567890123456789012346",
      postedAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "01234567890123456789012371",
      discussionId: "01234567890123456789012348",
      content: "これはテストノート2です",
      postedBy: "01234567890123456789012346",
      postedAt: "2024-01-01T11:00:00Z",
    },
  ];

  it("「ノート」という見出しが表示されること", async () => {
    await elem.updateComplete;
    await expect
      .element(page.getByRole("heading", { name: "ノート" }))
      .toBeVisible();
  });

  it("ノートがない場合に「ノートがありません」と表示されること", async () => {
    elem.notes = [];
    await elem.updateComplete;
    await expect.element(page.getByText("ノートがありません")).toBeVisible();
  });

  it("ノートの内容が表示されること", async () => {
    elem.notes = mockNotes;
    await elem.updateComplete;
    await expect
      .element(page.getByText("これはテストノート1です"))
      .toBeVisible();
    await expect
      .element(page.getByText("これはテストノート2です"))
      .toBeVisible();
  });

  it("ノート作成フォームが表示されること", async () => {
    await elem.updateComplete;
    await expect.element(page.getByPlaceholder("ノートを入力")).toBeVisible();
  });

  it("ノートを入力して追加ボタンをクリックするとonCreateNoteが呼ばれること", async () => {
    const onCreateNote = vi.fn();
    elem.onCreateNote = onCreateNote;
    await elem.updateComplete;

    const textarea = page.getByPlaceholder("ノートを入力");
    await textarea.fill("新しいノートの内容");
    await page.getByRole("button", { name: "追加" }).click();

    expect(onCreateNote).toHaveBeenCalledWith("新しいノートの内容");
  });

  it("空の入力では追加ボタンをクリックしてもonCreateNoteが呼ばれないこと", async () => {
    const onCreateNote = vi.fn();
    elem.onCreateNote = onCreateNote;
    await elem.updateComplete;

    await page.getByRole("button", { name: "追加" }).click();

    expect(onCreateNote).not.toHaveBeenCalled();
  });

  it("ノート追加後にテキストエリアがクリアされること", async () => {
    const onCreateNote = vi.fn();
    elem.onCreateNote = onCreateNote;
    await elem.updateComplete;

    const textarea = page.getByPlaceholder("ノートを入力");
    await textarea.fill("新しいノートの内容");
    await page.getByRole("button", { name: "追加" }).click();

    await expect.element(textarea).toHaveValue("");
  });
});
