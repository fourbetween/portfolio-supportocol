import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { Discussion } from "../../../../model/discussion";
import type { Project } from "../../../../model/project";
import type { ItemProjectPagePresenter } from "./item";

describe("ItemProjectPagePresenter", async () => {
  let elem: ItemProjectPagePresenter;

  const mockProject: Project = {
    id: "01234567890123456789012345",
    name: "テストプロジェクト",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-01T00:00:00Z",
  };

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
      "item-project-page-presenter"
    ) as ItemProjectPagePresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("プロジェクト名が表示されること", async () => {
    elem.project = mockProject;
    await elem.updateComplete;
    await expect
      .element(page.getByRole("heading", { level: 1 }))
      .toHaveTextContent("テストプロジェクト");
  });

  it("議論一覧のセクションタイトルが表示されること", async () => {
    elem.project = mockProject;
    await elem.updateComplete;
    await expect
      .element(page.getByRole("heading", { level: 2, name: "議論" }))
      .toBeVisible();
  });

  it("議論一覧が表示されること", async () => {
    elem.project = mockProject;
    elem.discussions = mockDiscussions;
    await elem.updateComplete;
    await expect.element(page.getByText("議論のテーマ1")).toBeVisible();
    await expect.element(page.getByText("議論のテーマ2")).toBeVisible();
  });

  it("議論がない場合は空のメッセージが表示されること", async () => {
    elem.project = mockProject;
    elem.discussions = [];
    await elem.updateComplete;
    await expect.element(page.getByText("議論がありません")).toBeVisible();
  });

  it("議論一覧がリンクとして表示されること", async () => {
    elem.project = mockProject;
    elem.discussions = mockDiscussions;
    elem.getDiscussionLink = (id) => `/discussions/${id}`;
    await elem.updateComplete;
    const link = page.getByRole("link", { name: "議論のテーマ1" });
    await expect.element(link).toBeVisible();
    await expect
      .element(link)
      .toHaveAttribute("href", "/discussions/01234567890123456789012348");
  });

  it("新規議論作成ボタンが表示されること", async () => {
    elem.project = mockProject;
    await elem.updateComplete;
    await expect
      .element(page.getByRole("button", { name: "新規議論" }))
      .toBeVisible();
  });

  it("新規議論作成ボタンをクリックするとonCreateDiscussionが呼ばれること", async () => {
    const onCreateDiscussion = vi.fn();
    elem.project = mockProject;
    elem.onCreateDiscussion = onCreateDiscussion;
    await elem.updateComplete;
    await page.getByRole("button", { name: "新規議論" }).click();
    expect(onCreateDiscussion).toHaveBeenCalled();
  });

  it("プロジェクト編集ボタンが表示されること", async () => {
    elem.project = mockProject;
    await elem.updateComplete;
    await expect
      .element(page.getByRole("button", { name: "編集" }))
      .toBeVisible();
  });

  it("プロジェクト編集ボタンをクリックするとonEditProjectが呼ばれること", async () => {
    const onEditProject = vi.fn();
    elem.project = mockProject;
    elem.onEditProject = onEditProject;
    await elem.updateComplete;
    await page.getByRole("button", { name: "編集" }).click();
    expect(onEditProject).toHaveBeenCalled();
  });

  it("プロジェクト削除ボタンが表示されること", async () => {
    elem.project = mockProject;
    await elem.updateComplete;
    await expect
      .element(page.getByRole("button", { name: "削除" }))
      .toBeVisible();
  });

  it("プロジェクト削除ボタンをクリックするとonDeleteProjectが呼ばれること", async () => {
    const onDeleteProject = vi.fn();
    elem.project = mockProject;
    elem.onDeleteProject = onDeleteProject;
    await elem.updateComplete;
    await page.getByRole("button", { name: "削除" }).click();
    expect(onDeleteProject).toHaveBeenCalled();
  });
});
