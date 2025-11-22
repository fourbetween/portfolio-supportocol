import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Comment, CommentType } from "../../../model/discussion";
import "./comment";
import type { CommentTreePresenter } from "./comment";

const comments: Comment[] = [
  {
    id: "01J8Y000000000000000000001",
    discussionId: "01J8Y000000000000000000000",
    parentCommentId: null,
    commentTypeId: "01J8Y000000000000000000001", // 提案
    content:
      "リスクベースアプローチを採用し、AIシステムをリスクレベル（許容できないリスク、高リスク、限定的リスク、最小リスク）に分類して規制すべきです。",
    postedBy: "user123",
    postedAt: "2023-10-25T10:00:00Z",
    status: "assigned",
  },
  {
    id: "01J8Y000000000000000000002",
    discussionId: "01J8Y000000000000000000000",
    parentCommentId: "01J8Y000000000000000000001",
    commentTypeId: "01J8Y000000000000000000002", // 賛成
    content:
      "賛成です。EUのAI法案でも同様のアプローチが取られており、国際的な整合性を保つ上でも有効だと思います。",
    postedBy: "dev_taro",
    postedAt: "2023-10-25T11:30:00Z",
    status: "assigned",
  },
  {
    id: "01J8Y000000000000000000003",
    discussionId: "01J8Y000000000000000000000",
    parentCommentId: "01J8Y000000000000000000001",
    commentTypeId: "01J8Y000000000000000000003", // 懸念
    content:
      "リスクの定義が曖昧になる可能性があります。「高リスク」の判定基準を明確にしないと、イノベーションを過度に萎縮させる恐れがあります。",
    postedBy: "ai_watcher",
    postedAt: "2023-10-25T13:45:00Z",
    status: "assigned",
  },
  {
    id: "01J8Y000000000000000000004",
    discussionId: "01J8Y000000000000000000000",
    parentCommentId: "01J8Y000000000000000000003",
    commentTypeId: "01J8Y000000000000000000004", // 補足
    content:
      "確かにその通りです。医療機器や重要インフラ制御など、人の生命や安全に直結する分野を具体的にリストアップする必要があります。",
    postedBy: "user123",
    postedAt: "2023-10-25T14:20:00Z",
    status: "assigned",
  },
];

const commentTypes: CommentType[] = [
  {
    id: "01J8Y000000000000000000001",
    ruleId: "r1",
    name: "提案",
    description: "",
    color: "#0969da",
  },
  {
    id: "01J8Y000000000000000000002",
    ruleId: "r1",
    name: "賛成",
    description: "",
    color: "#1a7f37",
  },
  {
    id: "01J8Y000000000000000000003",
    ruleId: "r1",
    name: "懸念",
    description: "",
    color: "#cf222e",
  },
  {
    id: "01J8Y000000000000000000004",
    ruleId: "r1",
    name: "補足",
    description: "",
    color: "#9a6700",
  },
];

const meta = {
  title: "presenter/tree/comment",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <comment-tree-presenter
        .comments=${args.comments}
        .commentTypes=${args.commentTypes}
      ></comment-tree-presenter>
    `,
  argTypes: {
    comments: { control: "object" },
    commentTypes: { control: "object" },
  },
} satisfies Meta<CommentTreePresenter>;

export default meta;
type Story = StoryObj<CommentTreePresenter>;

export const Default: Story = {
  args: {
    comments: comments,
    commentTypes: commentTypes,
  },
};
