import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { ItemDiscussionPagePresenter } from "./item";

const mockDiscussion = {
  id: "01234567890123456789012348",
  theme: "AIによるコードレビューは有用か",
  background:
    "AIツールの進化に伴い、コードレビューの自動化が検討されている。GitHub CopilotやChatGPTなどのツールが広く普及し、開発現場での活用が進んでいる。",
  conclusion:
    "適切に活用すれば有用である。ただし、人間によるレビューも併用すべきである。",
  ruleId: "01234567890123456789012349",
  visibilityLevel: "everyone" as const,
  commentPermissionLevel: "everyone" as const,
  createdBy: "01234567890123456789012346",
  createdAt: "2024-01-10T00:00:00Z",
  status: "open" as const,
};

const mockCommentTypes = [
  {
    id: "01234567890123456789012351",
    name: "主張",
    description: "議論の主張を述べる",
    color: "#0969da",
  },
  {
    id: "01234567890123456789012352",
    name: "根拠",
    description: "主張を裏付ける根拠を述べる",
    color: "#2da44e",
  },
  {
    id: "01234567890123456789012353",
    name: "反論",
    description: "主張や根拠に対する反論を述べる",
    color: "#cf222e",
  },
  {
    id: "01234567890123456789012354",
    name: "質問",
    description: "主張や根拠に対する質問を述べる",
    color: "#bf8700",
  },
];

const mockComments = [
  {
    id: "01234567890123456789012360",
    discussionId: "01234567890123456789012348",
    parentCommentId: "",
    commentTypeId: "01234567890123456789012351",
    content:
      "AIによるコードレビューは開発効率を大幅に向上させる。特に、コーディング規約のチェックやセキュリティ脆弱性の検出において効果的である。",
    postedBy: "01234567890123456789012346",
    postedAt: "2024-01-10T10:00:00Z",
    status: "assigned" as const,
  },
  {
    id: "01234567890123456789012361",
    discussionId: "01234567890123456789012348",
    parentCommentId: "01234567890123456789012360",
    commentTypeId: "01234567890123456789012352",
    content:
      "実際にGitHub Copilotを導入した企業では、コードレビューの時間が平均30%削減されたというデータがある。",
    postedBy: "01234567890123456789012346",
    postedAt: "2024-01-10T11:00:00Z",
    status: "assigned" as const,
  },
  {
    id: "01234567890123456789012362",
    discussionId: "01234567890123456789012348",
    parentCommentId: "01234567890123456789012360",
    commentTypeId: "01234567890123456789012352",
    content:
      "静的解析ツールと比較して、AIはより文脈を理解したレビューが可能である。",
    postedBy: "01234567890123456789012347",
    postedAt: "2024-01-10T12:00:00Z",
    status: "assigned" as const,
  },
  {
    id: "01234567890123456789012363",
    discussionId: "01234567890123456789012348",
    parentCommentId: "01234567890123456789012360",
    commentTypeId: "01234567890123456789012353",
    content:
      "AIは設計上の問題やビジネスロジックの誤りを見つけることが難しい。人間によるレビューは依然として必要である。",
    postedBy: "01234567890123456789012347",
    postedAt: "2024-01-10T13:00:00Z",
    status: "assigned" as const,
  },
  {
    id: "01234567890123456789012364",
    discussionId: "01234567890123456789012348",
    parentCommentId: "01234567890123456789012360",
    commentTypeId: "01234567890123456789012354",
    content:
      "AIによるレビューの精度はどの程度なのか？誤検出の割合についてのデータはあるか？",
    postedBy: "01234567890123456789012348",
    postedAt: "2024-01-10T14:00:00Z",
    status: "assigned" as const,
  },
  {
    id: "01234567890123456789012365",
    discussionId: "01234567890123456789012348",
    parentCommentId: "",
    commentTypeId: "01234567890123456789012351",
    content:
      "AIコードレビューはジュニアエンジニアの学習ツールとしても有用である。即座にフィードバックが得られるため、スキルアップに貢献する。",
    postedBy: "01234567890123456789012346",
    postedAt: "2024-01-10T15:00:00Z",
    status: "assigned" as const,
  },
  {
    id: "01234567890123456789012366",
    discussionId: "01234567890123456789012348",
    parentCommentId: "01234567890123456789012365",
    commentTypeId: "01234567890123456789012353",
    content:
      "AIのフィードバックに依存しすぎると、自分で考える力が育たない可能性がある。",
    postedBy: "01234567890123456789012347",
    postedAt: "2024-01-10T16:00:00Z",
    status: "assigned" as const,
  },
];

const mockNotes = [
  {
    id: "01234567890123456789012380",
    discussionId: "01234567890123456789012348",
    content:
      "この議論では、AIの進化による開発効率への影響について考える必要がある",
    postedBy: "01234567890123456789012346",
    postedAt: "2024-01-10T09:00:00Z",
  },
  {
    id: "01234567890123456789012381",
    discussionId: "01234567890123456789012348",
    content: "参考資料: GitHub Copilot導入事例レポート",
    postedBy: "01234567890123456789012346",
    postedAt: "2024-01-10T09:30:00Z",
  },
];

const mockIssues = [
  {
    id: "01234567890123456789012390",
    commentId: "01234567890123456789012360",
    issueType: "contradiction" as const,
    description:
      "この主張は「開発効率を大幅に向上させる」と述べていますが、後述の反論で「設計上の問題やビジネスロジックの誤りを見つけることが難しい」と認めており、一部矛盾があります。",
    createdBy: "01234567890123456789012347",
    createdAt: "2024-01-10T18:00:00Z",
  },
  {
    id: "01234567890123456789012391",
    commentId: "01234567890123456789012360",
    issueType: "circular_logic" as const,
    description:
      "「AIによるコードレビューは効果的である」という結論を、「AIによるコードレビューが効果的だから導入されている」という前提で証明しようとしている循環論法が見られます。",
    createdBy: "01234567890123456789012348",
    createdAt: "2024-01-10T19:00:00Z",
  },
  {
    id: "01234567890123456789012392",
    commentId: "01234567890123456789012365",
    issueType: "contradiction" as const,
    description:
      "学習ツールとして有用と主張していますが、反論で「AIに依存しすぎると自分で考える力が育たない」と認めており、主張が弱体化しています。",
    createdBy: "01234567890123456789012347",
    createdAt: "2024-01-10T20:00:00Z",
  },
];

const meta = {
  title: "presenter/page/discussion/item",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <item-discussion-page-presenter
        .discussion=${args.discussion}
        .comments=${args.comments}
        .commentTypes=${args.commentTypes}
        .focusedCommentId=${args.focusedCommentId}
        .notes=${args.notes}
        .issues=${args.issues}
        .onAddComment=${args.onAddComment}
        .onFocusComment=${args.onFocusComment}
        .onClearFocus=${args.onClearFocus}
        .onChangeStatus=${args.onChangeStatus}
        .onAddIssue=${args.onAddIssue}
        .onShowIssues=${args.onShowIssues}
        .onCreateNote=${args.onCreateNote}
        .onDeleteNote=${args.onDeleteNote}
        .onConvertNoteToComment=${args.onConvertNoteToComment}
      ></item-discussion-page-presenter>
    `,
  argTypes: {
    onAddComment: { action: "onAddComment" },
    onFocusComment: { action: "onFocusComment" },
    onClearFocus: { action: "onClearFocus" },
    onChangeStatus: { action: "onChangeStatus" },
    onAddIssue: { action: "onAddIssue" },
    onShowIssues: { action: "onShowIssues" },
    onCreateNote: { action: "onCreateNote" },
    onDeleteNote: { action: "onDeleteNote" },
    onConvertNoteToComment: { action: "onConvertNoteToComment" },
  },
} satisfies Meta<ItemDiscussionPagePresenter>;

export default meta;
type Story = StoryObj<ItemDiscussionPagePresenter>;

export const Default: Story = {
  args: {
    discussion: mockDiscussion,
    comments: mockComments,
    commentTypes: mockCommentTypes,
    notes: mockNotes,
    issues: mockIssues,
  },
};

export const NoComments: Story = {
  args: {
    discussion: mockDiscussion,
    comments: [],
    commentTypes: mockCommentTypes,
    notes: [],
    issues: [],
  },
};

export const SingleRootComment: Story = {
  args: {
    discussion: mockDiscussion,
    comments: [mockComments[0]],
    commentTypes: mockCommentTypes,
    notes: mockNotes,
    issues: [mockIssues[0], mockIssues[1]],
  },
};

export const MultipleRootComments: Story = {
  args: {
    discussion: mockDiscussion,
    comments: [mockComments[0], mockComments[5]],
    commentTypes: mockCommentTypes,
    notes: mockNotes,
    issues: mockIssues,
  },
};

const deepNestedComments = [
  {
    id: "01234567890123456789012370",
    discussionId: "01234567890123456789012348",
    parentCommentId: "",
    commentTypeId: "01234567890123456789012351",
    content: "レベル1: AIによるコードレビューは開発効率を向上させる。",
    postedBy: "01234567890123456789012346",
    postedAt: "2024-01-10T10:00:00Z",
    status: "assigned" as const,
  },
  {
    id: "01234567890123456789012371",
    discussionId: "01234567890123456789012348",
    parentCommentId: "01234567890123456789012370",
    commentTypeId: "01234567890123456789012352",
    content: "レベル2: 具体的なデータとして、レビュー時間が30%削減された。",
    postedBy: "01234567890123456789012347",
    postedAt: "2024-01-10T11:00:00Z",
    status: "assigned" as const,
  },
  {
    id: "01234567890123456789012372",
    discussionId: "01234567890123456789012348",
    parentCommentId: "01234567890123456789012371",
    commentTypeId: "01234567890123456789012354",
    content: "レベル3: そのデータの出典は何か？",
    postedBy: "01234567890123456789012348",
    postedAt: "2024-01-10T12:00:00Z",
    status: "assigned" as const,
  },
  {
    id: "01234567890123456789012373",
    discussionId: "01234567890123456789012348",
    parentCommentId: "01234567890123456789012372",
    commentTypeId: "01234567890123456789012352",
    content: "レベル4: GitHub公式ブログの2023年調査レポートによる。",
    postedBy: "01234567890123456789012347",
    postedAt: "2024-01-10T13:00:00Z",
    status: "assigned" as const,
  },
  {
    id: "01234567890123456789012374",
    discussionId: "01234567890123456789012348",
    parentCommentId: "01234567890123456789012373",
    commentTypeId: "01234567890123456789012353",
    content:
      "レベル5: そのレポートはGitHub自身の製品に関するものであり、バイアスがある可能性がある。",
    postedBy: "01234567890123456789012348",
    postedAt: "2024-01-10T14:00:00Z",
    status: "assigned" as const,
  },
  {
    id: "01234567890123456789012375",
    discussionId: "01234567890123456789012348",
    parentCommentId: "01234567890123456789012374",
    commentTypeId: "01234567890123456789012352",
    content:
      "レベル6: 第三者機関による検証も行われており、類似の結果が報告されている。",
    postedBy: "01234567890123456789012347",
    postedAt: "2024-01-10T15:00:00Z",
    status: "assigned" as const,
  },
  {
    id: "01234567890123456789012376",
    discussionId: "01234567890123456789012348",
    parentCommentId: "01234567890123456789012375",
    commentTypeId: "01234567890123456789012354",
    content: "レベル7: その第三者機関とは具体的にどこか？",
    postedBy: "01234567890123456789012348",
    postedAt: "2024-01-10T16:00:00Z",
    status: "assigned" as const,
  },
  {
    id: "01234567890123456789012377",
    discussionId: "01234567890123456789012348",
    parentCommentId: "01234567890123456789012376",
    commentTypeId: "01234567890123456789012352",
    content:
      "レベル8: MIT Computer Science and Artificial Intelligence Laboratory (CSAIL)の研究チームである。",
    postedBy: "01234567890123456789012347",
    postedAt: "2024-01-10T17:00:00Z",
    status: "assigned" as const,
  },
];

export const DeepNestedComments: Story = {
  args: {
    discussion: mockDiscussion,
    comments: deepNestedComments,
    commentTypes: mockCommentTypes,
    notes: mockNotes,
    issues: [],
  },
};

export const FocusedOnRootChild: Story = {
  args: {
    discussion: mockDiscussion,
    comments: mockComments,
    commentTypes: mockCommentTypes,
    focusedCommentId: "01234567890123456789012361", // 根拠コメント1（ルートの子）
    notes: mockNotes,
    issues: mockIssues,
  },
};

export const FocusedOnDeepNested: Story = {
  args: {
    discussion: mockDiscussion,
    comments: deepNestedComments,
    commentTypes: mockCommentTypes,
    focusedCommentId: "01234567890123456789012375", // レベル6
    notes: mockNotes,
    issues: [],
  },
};
