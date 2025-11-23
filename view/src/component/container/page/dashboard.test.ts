import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { client } from "../../../api/client";
import "../../../import";
import { accountMethods } from "../../../model/account";
import type { DashboardPageContainer } from "./dashboard";

describe("DashboardPageContainer", () => {
  let elem: DashboardPageContainer;

  beforeEach(() => {
    // Mock client methods
    vi.spyOn(client, "GET").mockResolvedValue({ data: [], error: null } as any);
    vi.spyOn(client, "POST").mockResolvedValue({
      data: {},
      error: null,
    } as any);

    // Mock accountMethods
    vi.spyOn(accountMethods, "authHeader").mockResolvedValue({
      Authorization: "Bearer token",
    });

    elem = document.createElement(
      "dashboard-page-container"
    ) as DashboardPageContainer;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
    vi.restoreAllMocks();
  });

  it("議論を作成できること", async () => {
    // 1. Click "新規作成" button
    const createButton = page.getByRole("button", { name: "新規作成" });
    await expect.element(createButton).toBeInTheDocument();
    await createButton.click();

    // 2. Fill form in popup
    const themeInput = page.getByLabelText("テーマ");
    await expect.element(themeInput).toBeVisible();
    await themeInput.fill("新しい議論");

    const ruleSelect = page.getByLabelText("ルール");
    await ruleSelect.selectOptions("rule1");

    // 3. Submit
    const submitButton = page.getByRole("button", { name: "議論を作成" });
    await submitButton.click();

    // 4. Verify API call
    expect(client.POST).toHaveBeenCalledWith(
      "/discussions",
      expect.objectContaining({
        body: expect.objectContaining({
          theme: "新しい議論",
          ruleId: "rule1",
        }),
      })
    );
  });
});
