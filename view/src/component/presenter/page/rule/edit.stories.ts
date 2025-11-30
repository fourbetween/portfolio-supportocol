import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Rule } from "../../../../model/rule";
import type { EditRulePagePresenter } from "./edit";

const mockRule: Rule = {
  id: "01234567890123456789012345",
  name: "基本的な議論",
  description: "論理的な議論を行うための基本的なルールセットです。",
  createdBy: "01234567890123456789012346",
  createdAt: "2024-01-01T00:00:00Z",
  commentTypes: [
    {
      id: "01234567890123456789012347",
      name: "主張",
      description: "自分の意見や提案を述べるコメント",
      color: "#0969da",
    },
    {
      id: "01234567890123456789012348",
      name: "根拠",
      description: "主張を裏付ける根拠",
      color: "#1a7f37",
    },
    {
      id: "01234567890123456789012349",
      name: "質問",
      description: "不明点を確認するコメント",
      color: "#d29922",
    },
    {
      id: "01234567890123456789012350",
      name: "反論",
      description: "主張に対する反論",
      color: "#cf222e",
    },
  ],
  commentTypePaths: [
    {
      childCommentTypeId: "01234567890123456789012347",
      parentCommentTypeId: "01234567890123456789012348",
    },
    {
      childCommentTypeId: "01234567890123456789012347",
      parentCommentTypeId: "01234567890123456789012349",
    },
    {
      childCommentTypeId: "01234567890123456789012347",
      parentCommentTypeId: "01234567890123456789012350",
    },
    {
      childCommentTypeId: "01234567890123456789012348",
      parentCommentTypeId: "01234567890123456789012349",
    },
    {
      childCommentTypeId: "01234567890123456789012350",
      parentCommentTypeId: "01234567890123456789012348",
    },
  ],
};

const meta = {
  title: "presenter/page/rule/edit",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <edit-rule-page-presenter
        .rule=${args.rule}
        .onSave=${args.onSave}
        .onCancel=${args.onCancel}
      ></edit-rule-page-presenter>
    `,
  argTypes: {
    onSave: { action: "onSave" },
    onCancel: { action: "onCancel" },
  },
} satisfies Meta<EditRulePagePresenter>;

export default meta;
type Story = StoryObj<EditRulePagePresenter>;

export const Default: Story = {
  args: {
    rule: mockRule,
  },
};

export const Empty: Story = {
  args: {
    rule: {
      id: "",
      name: "",
      description: "",
      createdBy: "",
      createdAt: "",
      commentTypes: [],
      commentTypePaths: [],
    },
  },
};
