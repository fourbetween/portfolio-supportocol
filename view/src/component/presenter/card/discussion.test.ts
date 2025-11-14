import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type {
  DiscussionCardPresenter,
  DiscussionCardProps,
} from "./discussion";

describe("DiscussionCardPresenter", async () => {
  let elem: DiscussionCardPresenter;
  const discussionCard: DiscussionCardProps = {
    id: "01234567890123456789012345",
    theme: "How to improve the filtering logic?",
    authorName: "octocat",
    authorAvatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCYOAwszR78qrnivx9pc-M6avYiFr5NkNFJUUPaAul-xToT_2myEsgKuKZ5-k1r-U1UKCnSo4X4u4fseAOlQhgw9SeWlZx7-kL6JbHXEyHroqYDf_u33yhYENDvAR_g0SYRdpzp_Et1tNSgJm-oU8Roto4gpy9-WIqujVfU5XTxnc9Hj-_cVq0WMQKWBOpC4_BLWSXSw_9kcM35sArc60CTXl21sJqig-Z1oVTBhwxe3BlZn9srrcC_Ixi4r00_KinUOtFbwO8xkB0",
    commentCount: 12,
  };

  beforeEach(() => {
    elem = document.createElement(
      "discussion-card-presenter"
    ) as DiscussionCardPresenter;
    elem.discussionCard = discussionCard;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("テーマが表示されること", async () => {
    await expect
      .element(page.getByText("How to improve the filtering logic?"))
      .toBeInTheDocument();
  });

  it("作成者名が表示されること", async () => {
    await expect.element(page.getByText("octocat")).toBeInTheDocument();
  });

  it("コメント数が表示されること", async () => {
    await expect.element(page.getByText("12")).toBeInTheDocument();
  });
});
