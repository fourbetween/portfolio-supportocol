import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { ItemProjectPagePresenter } from "./item";

const mockProject = {
  id: "01234567890123456789012345",
  name: "AIコードレビュープロジェクト",
  createdBy: "01234567890123456789012346",
  createdAt: "2024-01-01T00:00:00Z",
};

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
    theme: "マイクロサービスアーキテクチャの採用基準",
    background:
      "大規模なシステム開発においてアーキテクチャ選択は重要な課題である",
    conclusion: "チーム規模とシステム複雑性を考慮して判断する",
    ruleId: "01234567890123456789012349",
    visibilityLevel: "owner" as const,
    commentPermissionLevel: "owner" as const,
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-12T00:00:00Z",
    status: "closed" as const,
  },
];

const getDiscussionLink = (id: string) => `/discussions/${id}`;

const meta = {
  title: "presenter/page/project/item",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <item-project-page-presenter
        .project=${args.project}
        .discussions=${args.discussions}
        .getDiscussionLink=${getDiscussionLink}
        .onCreateDiscussion=${args.onCreateDiscussion}
        .onEditProject=${args.onEditProject}
        .onDeleteProject=${args.onDeleteProject}
      ></item-project-page-presenter>
    `,
  argTypes: {
    onCreateDiscussion: { action: "onCreateDiscussion" },
    onEditProject: { action: "onEditProject" },
    onDeleteProject: { action: "onDeleteProject" },
  },
} satisfies Meta<ItemProjectPagePresenter>;

export default meta;
type Story = StoryObj<ItemProjectPagePresenter>;

export const Default: Story = {
  args: {
    project: mockProject,
    discussions: mockDiscussions,
  },
};

export const Empty: Story = {
  args: {
    project: mockProject,
    discussions: [],
  },
};

export const SingleDiscussion: Story = {
  args: {
    project: mockProject,
    discussions: [mockDiscussions[0]],
  },
};
