import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { Project } from "../../../model/project";
import type { ProjectSelectPresenter } from "./project";

describe("ProjectSelectPresenter", async () => {
  let elem: ProjectSelectPresenter;
  const projects: Project[] = [
    {
      id: "1",
      name: "Project Alpha",
      createdBy: "user1",
      createdAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "Project Beta",
      createdBy: "user1",
      createdAt: "2025-01-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    elem = document.createElement(
      "project-select-presenter"
    ) as ProjectSelectPresenter;
    elem.projects = projects;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("セレクトボックスが表示されること", async () => {
    const select = elem.renderRoot.querySelector("select");
    expect(select).toBeTruthy();
  });

  it("すべてのプロジェクトオプションが表示されること", async () => {
    await expect.element(page.getByText("Project Alpha")).toBeInTheDocument();
    await expect.element(page.getByText("Project Beta")).toBeInTheDocument();
  });

  it("All Projectsオプションが表示されること", async () => {
    await expect.element(page.getByText("All Projects")).toBeInTheDocument();
  });

  it("デフォルトで空文字が選択されること", async () => {
    const select = elem.renderRoot.querySelector("select") as HTMLSelectElement;
    expect(select.value).toBe("");
  });

  it("プロジェクトが空の場合でもAll Projectsが表示されること", async () => {
    elem.projects = [];
    await elem.updateComplete;
    await expect.element(page.getByText("All Projects")).toBeInTheDocument();
  });
});
