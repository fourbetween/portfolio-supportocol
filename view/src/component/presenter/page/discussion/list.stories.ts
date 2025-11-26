import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { ListDiscussionPagePresenter } from "./list";

const mockDiscussions = [
  {
    id: "01234567890123456789012348",
    theme: "AIによるコードレビューは有用か",
    background: "AIツールの進化に伴い、コードレビューの自動化が検討されている",
    conclusion: "",
    ruleId: "01234567890123456789012349",
    visibilityLevel: "everyone" as const,
    commentPermissionLevel: "everyone" as const,
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-10T00:00:00Z",
    status: "open" as const,
  },
  {
    id: "01234567890123456789012350",
    theme: "リモートワークは生産性を向上させるか",
    background: "コロナ禍以降、リモートワークが普及している",
    conclusion: "",
    ruleId: "01234567890123456789012349",
    visibilityLevel: "authenticated" as const,
    commentPermissionLevel: "authenticated" as const,
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-11T00:00:00Z",
    status: "open" as const,
  },
  {
    id: "01234567890123456789012351",
    theme: "マイクロサービスアーキテクチャは常に最良の選択か",
    background:
      "大規模なシステムの設計において、マイクロサービスが推奨されることが多い",
    conclusion: "",
    ruleId: "01234567890123456789012349",
    visibilityLevel: "everyone" as const,
    commentPermissionLevel: "authenticated" as const,
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-12T00:00:00Z",
    status: "open" as const,
  },
];

const getDiscussionLink = (id: string) => `/discussions/${id}`;

const meta = {
  title: "presenter/page/discussion/list",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <list-discussion-page-presenter
        .discussions=${args.discussions}
        .getDiscussionLink=${getDiscussionLink}
        .onSearch=${args.onSearch}
      ></list-discussion-page-presenter>
    `,
  argTypes: {
    onSearch: { action: "onSearch" },
  },
} satisfies Meta<ListDiscussionPagePresenter>;

export default meta;
type Story = StoryObj<ListDiscussionPagePresenter>;

export const Default: Story = {
  args: {
    discussions: mockDiscussions,
  },
};

export const Empty: Story = {
  args: {
    discussions: [],
  },
};

export const SingleItem: Story = {
  args: {
    discussions: [mockDiscussions[0]],
  },
};
