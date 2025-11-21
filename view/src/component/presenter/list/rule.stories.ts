import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Rule } from "../../../model/rule";
import "./rule";
import type { RuleListPresenter } from "./rule";

const rules: Rule[] = [
  {
    id: "01J8Y000000000000000000001",
    name: "ディベート標準ルール",
    description:
      "肯定側と否定側に分かれて議論を行うための標準的なルールセットです。",
    createdBy: "admin",
    createdAt: "2023-10-01T00:00:00Z",
    commentTypes: [],
    commentTypePaths: [],
  },
  {
    id: "01J8Y000000000000000000002",
    name: "ブレインストーミング",
    description:
      "アイデアを自由に出し合うためのルール。批判的なコメントを制限しています。",
    createdBy: "user123",
    createdAt: "2023-09-28T00:00:00Z",
    commentTypes: [],
    commentTypePaths: [],
  },
  {
    id: "01J8Y000000000000000000003",
    name: "意思決定プロセス",
    description:
      "提案から決定までのプロセスを定義したルール。承認フローを含みます。",
    createdBy: "manager",
    createdAt: "2023-09-15T00:00:00Z",
    commentTypes: [],
    commentTypePaths: [],
  },
];

const meta = {
  title: "presenter/list/rule",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <rule-list-presenter .rules=${args.rules}></rule-list-presenter>
    `,
  argTypes: {
    rules: { control: "object" },
  },
} satisfies Meta<RuleListPresenter>;

export default meta;
type Story = StoryObj<RuleListPresenter>;

export const Default: Story = {
  args: {
    rules: rules,
  },
};

export const Empty: Story = {
  args: {
    rules: [],
  },
};
