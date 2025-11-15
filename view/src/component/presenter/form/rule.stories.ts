import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CommentType, CommentTypePath, Rule } from "../../../model/rule";
import "./rule";
import type { RuleFormPresenter } from "./rule";

const meta = {
  title: "presenter/form/rule",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <rule-form-presenter
        .rule=${args.rule}
        .commentTypes=${args.commentTypes}
        .commentTypePaths=${args.commentTypePaths}
      ></rule-form-presenter>
    `,
  argTypes: {
    rule: { control: "object" },
    commentTypes: { control: "object" },
    commentTypePaths: { control: "object" },
  },
} satisfies Meta<RuleFormPresenter>;

export default meta;
type Story = StoryObj<RuleFormPresenter>;

const sampleCommentTypes: CommentType[] = [
  {
    id: "1",
    ruleId: "rule1",
    name: "主張",
    description: "議論のテーマに対する主張や意見を述べるコメント",
    color: "#0969DA",
  },
  {
    id: "2",
    ruleId: "rule1",
    name: "根拠",
    description: "主張を裏付けるための根拠や証拠を示すコメント",
    color: "#1A7F37",
  },
  {
    id: "3",
    ruleId: "rule1",
    name: "反論",
    description: "主張や根拠に対する反論や異なる視点を提示するコメント",
    color: "#D73A49",
  },
];

const sampleCommentTypePaths: CommentTypePath[] = [
  {
    id: "path1",
    ruleId: "rule1",
    fromCommentTypeId: "1",
    toCommentTypeId: "2",
  },
  {
    id: "path2",
    ruleId: "rule1",
    fromCommentTypeId: "2",
    toCommentTypeId: "3",
  },
  {
    id: "path3",
    ruleId: "rule1",
    fromCommentTypeId: "3",
    toCommentTypeId: "2",
  },
];

const sampleRule: Partial<Rule> = {
  name: "標準的な議論フロー",
  description:
    "主張、根拠、反論の3つのコメント種類を使って論理的な議論を行うためのルールです。",
};

export const Default: Story = {
  args: {
    rule: sampleRule,
    commentTypes: sampleCommentTypes,
    commentTypePaths: sampleCommentTypePaths,
  },
};

export const Empty: Story = {
  args: {
    rule: {
      name: "",
      description: "",
    },
    commentTypes: [],
    commentTypePaths: [],
  },
};

export const WithoutPaths: Story = {
  args: {
    rule: sampleRule,
    commentTypes: sampleCommentTypes,
    commentTypePaths: [],
  },
};

export const WithSingleCommentType: Story = {
  args: {
    rule: sampleRule,
    commentTypes: [sampleCommentTypes[0]],
    commentTypePaths: [],
  },
};
