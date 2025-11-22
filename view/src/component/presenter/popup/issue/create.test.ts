import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "./create";
import { CreateIssuePopupPresenter } from "./create";

describe("CreateIssuePopupPresenter", () => {
  let element: CreateIssuePopupPresenter;

  beforeEach(async () => {
    element = document.createElement(
      "create-issue-popup-presenter"
    ) as CreateIssuePopupPresenter;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  it("指摘の種類を選択できること", async () => {
    const select = element.shadowRoot?.querySelector(
      "#type"
    ) as HTMLSelectElement;
    expect(select).to.exist;
    expect(select.options.length).to.be.greaterThan(0);
  });

  it("ヘッダーのタイトルがspanタグで表示されること", async () => {
    const headerSlot = element.shadowRoot?.querySelector(
      '[slot="header"]'
    ) as HTMLElement;
    expect(headerSlot).to.exist;
    expect(headerSlot.tagName).to.equal("SPAN");
    expect(headerSlot.textContent).to.equal("指摘作成");
  });
});
