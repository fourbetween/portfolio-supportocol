import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { NotesPanelPresenter } from "./notes";

const mockNotes = [
  {
    id: "01234567890123456789012370",
    discussionId: "01234567890123456789012348",
    content: "この議論では、AIの進化による社会的影響について考える必要がある",
    postedBy: "01234567890123456789012346",
    postedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "01234567890123456789012371",
    discussionId: "01234567890123456789012348",
    content: "技術的な側面と倫理的な側面の両方から検討すべき",
    postedBy: "01234567890123456789012346",
    postedAt: "2024-01-10T11:00:00Z",
  },
  {
    id: "01234567890123456789012372",
    discussionId: "01234567890123456789012348",
    content:
      "参考文献:\n- AI倫理ガイドライン\n- 機械学習の最新動向\n- プライバシー保護法規",
    postedBy: "01234567890123456789012346",
    postedAt: "2024-01-10T12:00:00Z",
  },
];

const meta: Meta<NotesPanelPresenter> = {
  title: "presenter/panel/notes",
  component: "notes-panel-presenter",
  render: (args) => html`
    <div style="width: 300px; height: 500px;">
      <notes-panel-presenter
        .notes=${args.notes}
        .onCreateNote=${args.onCreateNote}
        .onDeleteNote=${args.onDeleteNote}
      ></notes-panel-presenter>
    </div>
  `,
  argTypes: {
    onCreateNote: { action: "onCreateNote" },
    onDeleteNote: { action: "onDeleteNote" },
  },
};

export default meta;
type Story = StoryObj<NotesPanelPresenter>;

export const Default: Story = {
  args: {
    notes: mockNotes,
  },
};

export const Empty: Story = {
  args: {
    notes: [],
  },
};

export const ManyNotes: Story = {
  args: {
    notes: [
      ...mockNotes,
      {
        id: "01234567890123456789012373",
        discussionId: "01234567890123456789012348",
        content: "追加のノート1: レビュー結果をまとめる必要がある",
        postedBy: "01234567890123456789012346",
        postedAt: "2024-01-10T13:00:00Z",
      },
      {
        id: "01234567890123456789012374",
        discussionId: "01234567890123456789012348",
        content:
          "追加のノート2: 次回のミーティングで議論する項目をリストアップ",
        postedBy: "01234567890123456789012346",
        postedAt: "2024-01-10T14:00:00Z",
      },
      {
        id: "01234567890123456789012375",
        discussionId: "01234567890123456789012348",
        content: "追加のノート3: 関連する議論へのリンクを追加すること",
        postedBy: "01234567890123456789012346",
        postedAt: "2024-01-10T15:00:00Z",
      },
    ],
  },
};

export const LongContent: Story = {
  args: {
    notes: [
      {
        id: "01234567890123456789012370",
        discussionId: "01234567890123456789012348",
        content:
          "これは非常に長いノートです。このノートには多くの情報が含まれており、テキストが折り返されることを確認するためのものです。実際の使用場面では、ユーザーは詳細なメモや参考情報を記録することがあります。この場合、UIがテキストを適切に処理し、読みやすく表示することが重要です。",
        postedBy: "01234567890123456789012346",
        postedAt: "2024-01-10T10:00:00Z",
      },
    ],
  },
};
