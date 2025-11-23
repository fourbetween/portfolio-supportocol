import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { Project } from "../../../model/project";
import type { ProjectListPresenter } from "./project";

describe("ProjectListPresenter", async () => {
  let elem: ProjectListPresenter;

  const projects: Project[] = [
    {
      id: "01J8Y000000000000000000001",
      name: "AI倫理ガイドライン策定",
      createdBy: "01J8Y000000000000000000000",
      createdAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "01J8Y000000000000000000002",
      name: "新規事業アイデア",
      createdBy: "01J8Y000000000000000000000",
      createdAt: "2025-01-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    elem = document.createElement(
      "project-list-presenter"
    ) as ProjectListPresenter;
    elem.projects = projects;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("プロジェクト一覧が表示されること", async () => {
    await expect
      .element(page.getByText("AI倫理ガイドライン策定"))
      .toBeInTheDocument();
    await expect
      .element(page.getByText("新規事業アイデア"))
      .toBeInTheDocument();
  });

  it("プロジェクト作成ポップアップが含まれていること", async () => {
    const popup = elem.shadowRoot?.querySelector(
      "create-project-popup-presenter"
    );
    expect(popup).not.toBeNull();
  });
});
