import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./discussion";
import type { DiscussionListPresenter, DiscussionView } from "./discussion";

const discussions: DiscussionView[] = [
  {
    id: "01J8Y000000000000000000001",
    theme: "生成AIの著作権リスクについて",
    background: "背景",
    conclusion: "結論",
    ruleId: "01J8Y000000000000000000000",
    visibilityLevel: "everyone",
    commentPermissionLevel: "everyone",
    createdBy: "01J8Y000000000000000000000",
    createdAt: "2025-01-01T00:00:00Z",
    status: "open",
    projectName: "AI倫理ガイドライン策定",
    commentCount: 12,
    updatedAtFormatted: "2時間前",
  },
  {
    id: "01J8Y000000000000000000002",
    theme: "リモートワーク手当の増額提案",
    background: "背景",
    conclusion: "結論",
    ruleId: "01J8Y000000000000000000000",
    visibilityLevel: "everyone",
    commentPermissionLevel: "everyone",
    createdBy: "01J8Y000000000000000000000",
    createdAt: "2025-01-02T00:00:00Z",
    status: "open",
    projectName: "オフィス移転計画",
    commentCount: 8,
    updatedAtFormatted: "5時間前",
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
