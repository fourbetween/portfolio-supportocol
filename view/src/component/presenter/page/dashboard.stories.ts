import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { DashboardPagePresenter } from "./dashboard";

const mockProjects = [
  {
    id: "01234567890123456789012345",
    name: "プロジェクト1",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "01234567890123456789012347",
    name: "プロジェクト2",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "01234567890123456789012348",
    name: "プロジェクト3",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-03T00:00:00Z",
  },
];

const mockDiscussions = [
  {
    id: "01234567890123456789012349",
    theme: "AIによるコードレビューは有用か",
    background: "AIツールの進化に伴い、コードレビューの自動化が検討されている",
    conclusion: "",
    ruleId: "01234567890123456789012350",
    visibilityLevel: "everyone" as const,
    commentPermissionLevel: "everyone" as const,
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-10T00:00:00Z",
    status: "open" as const,
  },
  {
    id: "01234567890123456789012351",
    theme: "リモートワークは生産性を向上させるか",
    background: "コロナ禍以降、リモートワークが普及している",
    conclusion: "",
    ruleId: "01234567890123456789012350",
    visibilityLevel: "authenticated" as const,
    commentPermissionLevel: "authenticated" as const,
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-11T00:00:00Z",
    status: "open" as const,
  },
];

const meta = {
  title: "presenter/page/dashboard",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <dashboard-page-presenter
        .projects=${args.projects}
        .recentDiscussions=${args.recentDiscussions}
        .onCreateProject=${args.onCreateProject}
        .onSelectProject=${args.onSelectProject}
        .onSelectDiscussion=${args.onSelectDiscussion}
      ></dashboard-page-presenter>
    `,
  argTypes: {
    onCreateProject: { action: "onCreateProject" },
    onSelectProject: { action: "onSelectProject" },
    onSelectDiscussion: { action: "onSelectDiscussion" },
  },
} satisfies Meta<DashboardPagePresenter>;

export default meta;
type Story = StoryObj<DashboardPagePresenter>;

export const Default: Story = {
  args: {
    projects: mockProjects,
    recentDiscussions: mockDiscussions,
  },
};

export const Empty: Story = {
  args: {
    projects: [],
    recentDiscussions: [],
  },
};

export const WithProjectsOnly: Story = {
  args: {
    projects: mockProjects,
    recentDiscussions: [],
  },
};

export const WithDiscussionsOnly: Story = {
  args: {
    projects: [],
    recentDiscussions: mockDiscussions,
  },
};
