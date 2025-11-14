import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { Project } from "../../../model/project";
import type { ProjectCardPresenter } from "./project";

describe("ProjectCardPresenter", async () => {
  let elem: ProjectCardPresenter;
  const project: Project = {
    id: "project1",
    name: "Webアプリケーション開発",
    createdBy: "user1",
    createdAt: "2025-01-01T00:00:00Z",
  };
  beforeEach(() => {
    elem = document.createElement(
      "project-card-presenter"
    ) as ProjectCardPresenter;
    elem.project = project;
    document.body.appendChild(elem);
  });
  afterEach(() => {
    elem.remove();
  });

  it("プロジェクト名が表示されること", async () => {
    await expect
      .element(page.getByText("Webアプリケーション開発"))
      .toBeInTheDocument();
  });

  it("コメント数が表示されること", async () => {
    elem.commentCount = 8;
    await elem.updateComplete;
    await expect.element(page.getByText("8")).toBeInTheDocument();
  });

  it("フォルダアイコンが表示されること", async () => {
    const icon = elem.renderRoot.querySelector(".project-card-icon");
    expect(icon).toBeTruthy();
  });

  it("メニューボタンが表示されること", async () => {
    const menuButton = elem.renderRoot.querySelector(".project-card-menu");
    expect(menuButton).toBeTruthy();
  });
});
