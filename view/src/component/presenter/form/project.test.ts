import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { ProjectFormPresenter } from "./project";

describe("ProjectFormPresenter", async () => {
  let elem: ProjectFormPresenter;

  beforeEach(async () => {
    elem = document.createElement(
      "project-form-presenter"
    ) as ProjectFormPresenter;
    document.body.appendChild(elem);
    await elem.updateComplete;
  });

  afterEach(() => {
    elem.remove();
  });

  it("プロジェクト名のラベルが表示されること", async () => {
    await expect.element(page.getByText("プロジェクト名")).toBeInTheDocument();
  });
});
