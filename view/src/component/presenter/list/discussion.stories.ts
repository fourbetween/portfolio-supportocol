import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Discussion } from "../../../model/discussion";
import type { DiscussionListPresenter } from "./discussion";

const discussions: Discussion[] = [
  {
    id: "01J8Y000000000000000000001",
    theme: "AI開発における倫理的ガイドラインの策定について",
    background: "",
    conclusion: "",
    ruleId: "01J8Y000000000000000000000",
    visibilityLevel: "everyone",
    commentPermissionLevel: "everyone",
    createdBy: "user1",
    createdAt: "2025-01-01T00:00:00Z",
    status: "open",
  },
  {
    id: "01J8Y000000000000000000002",
    theme: "プライバシー保護に関する規定の策定",
    background: "",
    conclusion: "",
    ruleId: "01J8Y000000000000000000000",
    visibilityLevel: "authenticated",
    commentPermissionLevel: "authenticated",
    createdBy: "user2",
    createdAt: "2025-01-02T00:00:00Z",
    status: "open",
  },
  {
    id: "01J8Y000000000000000000003",
    theme: "初期ドラフトのレビュー",
    background: "",
    conclusion: "",
    ruleId: "01J8Y000000000000000000000",
    visibilityLevel: "everyone",
    commentPermissionLevel: "everyone",
    createdBy: "admin",
    createdAt: "2025-01-03T00:00:00Z",
    status: "closed",
  },
  {
    id: "01J8Y000000000000000000004",
    theme: "2022年度版ガイドライン",
    background: "",
    conclusion: "",
    ruleId: "01J8Y000000000000000000000",
    visibilityLevel: "owner",
    commentPermissionLevel: "owner",
    createdBy: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    status: "archived",
  },
];

const meta = {
  title: "presenter/list/discussion",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <discussion-list-presenter
        .discussions=${args.discussions}
      ></discussion-list-presenter>
    `,
  argTypes: {
    discussions: { control: "object" },
  },
} satisfies Meta<DiscussionListPresenter>;

export default meta;
type Story = StoryObj<DiscussionListPresenter>;

export const Default: Story = {
  args: {
    discussions: discussions,
  },
};

export const Empty: Story = {
  args: {
    discussions: [],
  },
};
