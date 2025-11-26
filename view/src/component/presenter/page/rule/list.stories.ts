import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { ListRulePagePresenter } from "./list";

const mockRules = [
  {
    id: "01234567890123456789012345",
    name: "標準議論ルール",
    description: "一般的な議論のためのルール",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-01T00:00:00Z",
    commentTypes: [],
    commentTypePaths: [],
  },
  {
    id: "01234567890123456789012347",
    name: "学術議論ルール",
    description: "学術的な議論のためのルール",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-02T00:00:00Z",
    commentTypes: [],
    commentTypePaths: [],
  },
  {
    id: "01234567890123456789012348",
    name: "ビジネス議論ルール",
    description: "ビジネスシーンでの議論のためのルール",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-03T00:00:00Z",
    commentTypes: [],
    commentTypePaths: [],
  },
];

const getRuleLink = (id: string) => `/rules/${id}`;

const meta = {
  title: "presenter/page/rule/list",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <list-rule-page-presenter
        .rules=${args.rules}
        .onCreateRule=${args.onCreateRule}
        .getRuleLink=${getRuleLink}
      ></list-rule-page-presenter>
    `,
  argTypes: {
    onCreateRule: { action: "onCreateRule" },
  },
} satisfies Meta<ListRulePagePresenter>;

export default meta;
type Story = StoryObj<ListRulePagePresenter>;

export const Default: Story = {
  args: {
    rules: mockRules,
  },
};

export const Empty: Story = {
  args: {
    rules: [],
  },
};
