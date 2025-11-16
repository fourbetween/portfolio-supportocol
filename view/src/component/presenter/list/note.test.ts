import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { Note } from "../../../model/discussion";
import type { NoteListPresenter } from "./note";

describe("NoteListPresenter", async () => {
  let elem: NoteListPresenter;
  const notes: Note[] = [
    {
      id: "id1",
      discussionId: "disc1",
      content:
        "Review the new API documentation for potential issues, especially regarding authentication endpoints.",
      postedBy: "user1",
      postedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "id2",
      discussionId: "disc1",
      content: "Add unit tests for the new data validation logic.",
      postedBy: "user2",
      postedAt: "2024-01-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    elem = document.createElement("note-list-presenter") as NoteListPresenter;
    elem.notes = notes;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("ノートのコンテンツが表示されること", async () => {
    await expect
      .element(page.getByText("Review the new API documentation"))
      .toBeInTheDocument();
  });

  it("複数のノートが表示されること", async () => {
    await expect
      .element(page.getByText("Review the new API documentation"))
      .toBeInTheDocument();
    await expect
      .element(
        page.getByText("Add unit tests for the new data validation logic.")
      )
      .toBeInTheDocument();
  });

  it("空のリストの場合、メッセージが表示されること", async () => {
    elem.notes = [];
    await elem.updateComplete;
    await expect.element(page.getByText("No notes yet")).toBeInTheDocument();
  });
});
