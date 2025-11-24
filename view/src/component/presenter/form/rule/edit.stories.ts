import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Rule } from "../../../../model/rule";
import type { EditRuleFormPresenter } from "./edit";

const rule: Rule = {
  id: "01J8Y000000000000000000001",
  name: "基本的な議論",
  description: "論理的な議論を行うための基本的なルールセットです。",
  createdBy: "admin",
  createdAt: "2023-10-01T00:00:00Z",
  commentTypes: [
    {
      id: "01J8Y000000000000000000011",
      name: "主張 (Proposition)",
      description: "自分の意見や提案を述べるコメント",
      color: "#0969da",
    },
    {
      id: "01J8Y000000000000000000012",
      name: "質問 (Question)",
      description: "不明点を確認するコメント",
      color: "#d29922",
    },
    {
      id: "01J8Y000000000000000000013",
      name: "回答 (Answer)",
      description: "質問に対する回答",
      color: "#1a7f37",
    },
    {
      id: "01J8Y000000000000000000014",
      name: "反論 (Objection)",
      description: "主張に対する反論",
      color: "#cf222e",
    },
  ],
  commentTypePaths: [
    {
      fromCommentTypeId: "01J8Y000000000000000000011",
      toCommentTypeId: "01J8Y000000000000000000012",
    },
    {
      fromCommentTypeId: "01J8Y000000000000000000011",
      toCommentTypeId: "01J8Y000000000000000000014",
    },
    {
      fromCommentTypeId: "01J8Y000000000000000000012",
      toCommentTypeId: "01J8Y000000000000000000013",
    },
    {
      fromCommentTypeId: "01J8Y000000000000000000013",
      toCommentTypeId: "01J8Y000000000000000000012",
    },
    {
      fromCommentTypeId: "01J8Y000000000000000000013",
      toCommentTypeId: "01J8Y000000000000000000014",
    },
    {
      fromCommentTypeId: "01J8Y000000000000000000014",
      toCommentTypeId: "01J8Y000000000000000000012",
    },
    {
      fromCommentTypeId: "01J8Y000000000000000000014",
      toCommentTypeId: "01J8Y000000000000000000014",
    },
  ],
};

const meta = {
  title: "presenter/form/rule/edit",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <edit-rule-form-presenter .rule=${args.rule}></edit-rule-form-presenter>
    `,
  argTypes: {
    rule: { control: "object" },
  },
} satisfies Meta<EditRuleFormPresenter>;

export default meta;
type Story = StoryObj<EditRuleFormPresenter>;

export const Default: Story = {
  args: {
    rule: rule,
  },
};
