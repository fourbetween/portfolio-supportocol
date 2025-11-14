import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Project } from "../../../model/project";
import "./project";
import type { ProjectCardPresenter } from "./project";

const meta = {
  title: "presenter/card/project",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <project-card-presenter
        .project=${args.project}
        .commentCount=${args.commentCount}
      ></project-card-presenter>
    `,
  argTypes: {
    project: { control: "object" },
    commentCount: { control: "number" },
  },
} satisfies Meta<ProjectCardPresenter>;

export default meta;
type Story = StoryObj<ProjectCardPresenter>;

const sampleProject: Project = {
  id: "project1",
  name: "Webアプリケーション開発",
  createdBy: "user1",
  createdAt: "2025-01-01T00:00:00Z",
};

export const Default: Story = {
  args: {
    project: sampleProject,
    commentCount: 8,
  },
};

export const NoComments: Story = {
  args: {
    project: sampleProject,
    commentCount: 0,
  },
};

export const ManyComments: Story = {
  args: {
    project: {
      ...sampleProject,
      name: "モバイルアプリ開発プロジェクト",
    },
    commentCount: 142,
  },
};
