import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { Workbook } from "../../../model/workbook";
import type { WorkbookListPresenter } from "./workbook";

describe("WorkbookListPresenter", async () => {
  let elem: WorkbookListPresenter;
  const workbooks: Workbook[] = [
    {
      id: "id1",
      title: "title1",
      status: "published",
    },
    {
      id: "id2",
      title: "title2",
      status: "draft",
    },
  ];
  beforeEach(() => {
    elem = document.createElement(
      "workbook-list-presenter"
    ) as WorkbookListPresenter;
    elem.workbooks = workbooks;
    document.body.appendChild(elem);
  });
  afterEach(() => {
    elem.remove();
  });

  it("タイトルが表示されること", async () => {
    await expect.element(page.getByText("title1")).toBeInTheDocument();
  });

  it("複数のワークブックが表示されること", async () => {
    await expect.element(page.getByText("title1")).toBeInTheDocument();
    await expect.element(page.getByText("title2")).toBeInTheDocument();
  });

  it("公開中のステータスが表示されること", async () => {
    await expect.element(page.getByText("公開中")).toBeInTheDocument();
  });

  it("下書きのステータスが表示されること", async () => {
    await expect.element(page.getByText("下書き")).toBeInTheDocument();
  });

  it("空のリストの場合、メッセージが表示されること", async () => {
    elem.workbooks = [];
    await elem.updateComplete;
    await expect
      .element(page.getByText("ワークブックがありません"))
      .toBeInTheDocument();
  });

  it("リストアイテムが正しい数だけ表示されること", async () => {
    const items = elem.renderRoot.querySelectorAll(".workbook-item");
    expect(items?.length).toBe(2);
  });
});
