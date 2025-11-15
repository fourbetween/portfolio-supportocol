import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { NoteFormPresenter } from "./note";

describe("NoteFormPresenter", async () => {
  let elem: NoteFormPresenter;

  beforeEach(async () => {
    elem = document.createElement("note-form-presenter") as NoteFormPresenter;
    document.body.appendChild(elem);
    await elem.updateComplete;
  });

  afterEach(() => {
    elem.remove();
  });

  it("テキストエリアが表示されること", async () => {
    await expect
      .element(page.getByPlaceholder("Jot down an idea..."))
      .toBeInTheDocument();
  });
});
