import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Project } from "../../../model/project";
import "./project";
import type { ProjectListPresenter } from "./project";

const projects: Project[] = [
  {
    id: "01J8Y000000000000000000001",
    name: "AI倫理ガイドライン策定",
    createdBy: "01J8Y000000000000000000000",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "01J8Y000000000000000000002",
    name: "新規事業アイデア",
    createdBy: "01J8Y000000000000000000000",
    createdAt: "2025-01-02T00:00:00Z",
  },
  {
    id: "01J8Y000000000000000000003",
    name: "オフィス移転計画",
    createdBy: "01J8Y000000000000000000000",
    createdAt: "2025-01-03T00:00:00Z",
  },
];

const meta = {
  title: "presenter/list/project",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <project-list-presenter
        .projects=${args.projects}
      ></project-list-presenter>
    `,
  argTypes: {
    projects: { control: "object" },
  },
} satisfies Meta<ProjectListPresenter>;

export default meta;
type Story = StoryObj<ProjectListPresenter>;

export const Default: Story = {
  args: {
    projects: projects,
  },
};

export const Empty: Story = {
  args: {
    projects: [],
  },
};
