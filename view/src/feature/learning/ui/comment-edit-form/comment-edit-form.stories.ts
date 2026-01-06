import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./comment-edit-form";

const meta: Meta = {
  title: "learning/ui/comment-edit-form",
  component: "learning-comment-edit-form",
  render: (args) =>
    html`
      <learning-comment-edit-form
        .initialType=${args.commentType}
        .initialContent=${args.content}
        .availableTypes=${args.availableTypes}
        @comment-create=${(e: any) => console.log("create", e)}
        @comment-update=${(e: any) => console.log("update", e)}
        @comment-cancel=${() => console.log("cancel")}
      ></learning-comment-edit-form>
    `,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    commentType: "質問",
    status: "active" as const,
    content: "",
    availableTypes: ["質問", "回答", "アイデア", "賛成", "反対"],
  },
};

export const WithContent: Story = {
  args: {
    commentType: "回答",
    status: "active" as const,
    content: "これは回答です。",
    availableTypes: ["質問", "回答", "アイデア", "賛成", "反対"],
  },
};
