import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { Discussion } from "../../../model/discussion";
import type { Project } from "../../../model/project";
import type { DashboardPagePresenter } from "./dashboard";

describe("DashboardPagePresenter", async () => {
  let elem: DashboardPagePresenter;

  const mockProjects: Project[] = [
    {
      id: "01234567890123456789012345",
      name: "プロジェクト1",
      createdBy: "01234567890123456789012346",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "01234567890123456789012347",
      name: "プロジェクト2",
      createdBy: "01234567890123456789012346",
      createdAt: "2024-01-02T00:00:00Z",
    },
  ];

  const mockDiscussions: Discussion[] = [
    {
      id: "01234567890123456789012348",
      theme: "議論のテーマ1",
      background: "背景",
      conclusion: "結論",
      ruleId: "01234567890123456789012349",
      visibilityLevel: "everyone",
      commentPermissionLevel: "everyone",
      createdBy: "01234567890123456789012346",
      createdAt: "2024-01-01T00:00:00Z",
      status: "open",
    },
    {
      id: "01234567890123456789012350",
      theme: "議論のテーマ2",
      background: "背景2",
      conclusion: "結論2",
      ruleId: "01234567890123456789012349",
      visibilityLevel: "authenticated",
      commentPermissionLevel: "authenticated",
      createdBy: "01234567890123456789012346",
      createdAt: "2024-01-02T00:00:00Z",
      status: "open",
    },
  ];

  beforeEach(() => {
    elem = document.createElement(
      "dashboard-page-presenter"
    ) as DashboardPagePresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("ページタイトルが表示されること", async () => {
    await elem.updateComplete;
    await expect
      .element(page.getByRole("heading", { level: 1 }))
      .toHaveTextContent("ダッシュボード");
  });

  it("プロジェクト一覧のセクションタイトルが表示されること", async () => {
    await elem.updateComplete;
    await expect
      .element(page.getByRole("heading", { level: 2, name: "プロジェクト" }))
      .toBeVisible();
  });

  it("プロジェクト一覧が表示されること", async () => {
    elem.projects = mockProjects;
    await elem.updateComplete;
    await expect.element(page.getByText("プロジェクト1")).toBeVisible();
    await expect.element(page.getByText("プロジェクト2")).toBeVisible();
  });

  it("新規プロジェクト作成ボタンが表示されること", async () => {
    await elem.updateComplete;
    await expect
      .element(page.getByRole("button", { name: "新規プロジェクト" }))
      .toBeVisible();
  });

  it("新規プロジェクト作成ボタンをクリックするとonCreateProjectが呼び出されること", async () => {
    const onCreateProject = vi.fn();
    elem.onCreateProject = onCreateProject;
    await elem.updateComplete;
    await page.getByRole("button", { name: "新規プロジェクト" }).click();
    expect(onCreateProject).toHaveBeenCalled();
  });

  it("最近アクセスした議論のセクションタイトルが表示されること", async () => {
    await elem.updateComplete;
    await expect
      .element(page.getByRole("heading", { level: 2, name: "最近の議論" }))
      .toBeVisible();
  });

  it("最近アクセスした議論一覧が表示されること", async () => {
    elem.recentDiscussions = mockDiscussions;
    await elem.updateComplete;
    await expect.element(page.getByText("議論のテーマ1")).toBeVisible();
    await expect.element(page.getByText("議論のテーマ2")).toBeVisible();
  });

  it("プロジェクトをクリックするとonSelectProjectが呼び出されること", async () => {
    const onSelectProject = vi.fn();
    elem.projects = mockProjects;
    elem.onSelectProject = onSelectProject;
    await elem.updateComplete;
    await page.getByText("プロジェクト1").click();
    expect(onSelectProject).toHaveBeenCalledWith(mockProjects[0]);
  });

  it("議論をクリックするとonSelectDiscussionが呼び出されること", async () => {
    const onSelectDiscussion = vi.fn();
    elem.recentDiscussions = mockDiscussions;
    elem.onSelectDiscussion = onSelectDiscussion;
    await elem.updateComplete;
    await page.getByText("議論のテーマ1").click();
    expect(onSelectDiscussion).toHaveBeenCalledWith(mockDiscussions[0]);
  });

  it("プロジェクトがない場合は空のメッセージが表示されること", async () => {
    elem.projects = [];
    await elem.updateComplete;
    await expect
      .element(page.getByText("プロジェクトがありません"))
      .toBeVisible();
  });

  it("最近の議論がない場合は空のメッセージが表示されること", async () => {
    elem.recentDiscussions = [];
    await elem.updateComplete;
    await expect
      .element(page.getByText("最近の議論がありません"))
      .toBeVisible();
  });
});
