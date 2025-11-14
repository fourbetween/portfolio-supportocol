import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Project } from "../../../model/project";
import "./project";
import type { ProjectSelectPresenter } from "./project";

const meta = {
  title: "presenter/select/project",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <project-select-presenter
        .projects=${args.projects}
        .selectedProjectId=${args.selectedProjectId}
        @project-change=${(e: CustomEvent) => {
          console.log("Selected project ID:", e.detail.projectId);
        }}
      ></project-select-presenter>
    `,
  argTypes: {
    projects: { control: "object" },
    selectedProjectId: { control: "text" },
  },
} satisfies Meta<ProjectSelectPresenter>;

export default meta;
type Story = StoryObj<ProjectSelectPresenter>;

const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Project Alpha",
    createdBy: "user1",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Project Beta",
    createdBy: "user1",
    createdAt: "2025-01-02T00:00:00Z",
  },
  {
    id: "3",
    name: "Project Gamma",
    createdBy: "user2",
    createdAt: "2025-01-03T00:00:00Z",
  },
];

export const Default: Story = {
  args: {
    projects: sampleProjects,
    selectedProjectId: "",
  },
};

export const WithSelectedProject: Story = {
  args: {
    projects: sampleProjects,
    selectedProjectId: "2",
  },
};

export const EmptyProjects: Story = {
  args: {
    projects: [],
    selectedProjectId: "",
  },
};

export const SingleProject: Story = {
  args: {
    projects: [sampleProjects[0]],
    selectedProjectId: "",
  },
};

export const ManyProjects: Story = {
  args: {
    projects: [
      ...sampleProjects,
      {
        id: "4",
        name: "Project Delta",
        createdBy: "user2",
        createdAt: "2025-01-04T00:00:00Z",
      },
      {
        id: "5",
        name: "Project Epsilon",
        createdBy: "user3",
        createdAt: "2025-01-05T00:00:00Z",
      },
      {
        id: "6",
        name: "Project Zeta",
        createdBy: "user3",
        createdAt: "2025-01-06T00:00:00Z",
      },
    ],
    selectedProjectId: "",
  },
};
