import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./column";
import type { KanbanColumnPresenter } from "./column";

const meta = {
  title: "presenter/kanban/column",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <kanban-column-presenter .title=${args.title} .count=${args.count}>
        ${args.withCards
          ? html`
              <div
                style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;"
              >
                <a
                  style="color: #1f2328; font-size: 14px; font-weight: 500; text-decoration: none;"
                  href="#"
                >
                  How to improve the filtering logic?
                </a>
                <div style="display: flex; justify-content: space-between;">
                  <div
                    style="display: flex; align-items: center; gap: 6px; color: #656d76; font-size: 12px;"
                  >
                    <div
                      style="width: 20px; height: 20px; border-radius: 50%; background: #ddd;"
                    ></div>
                    <span>octocat</span>
                  </div>
                  <div
                    style="display: flex; align-items: center; gap: 6px; color: #656d76; font-size: 12px;"
                  >
                    <span>💬</span>
                    <span>12</span>
                  </div>
                </div>
              </div>
              <div
                style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;"
              >
                <a
                  style="color: #1f2328; font-size: 14px; font-weight: 500; text-decoration: none;"
                  href="#"
                >
                  UI Design Language for the new dashboard
                </a>
                <div style="display: flex; justify-content: space-between;">
                  <div
                    style="display: flex; align-items: center; gap: 6px; color: #656d76; font-size: 12px;"
                  >
                    <div
                      style="width: 20px; height: 20px; border-radius: 50%; background: #ddd;"
                    ></div>
                    <span>JaneDoe</span>
                  </div>
                  <div
                    style="display: flex; align-items: center; gap: 6px; color: #656d76; font-size: 12px;"
                  >
                    <span>💬</span>
                    <span>4</span>
                  </div>
                </div>
              </div>
            `
          : ""}
      </kanban-column-presenter>
    `,
  argTypes: {
    title: { control: "text" },
    count: { control: "number" },
    withCards: { control: "boolean" },
  },
} satisfies Meta<KanbanColumnPresenter & { withCards: boolean }>;

export default meta;
type Story = StoryObj<KanbanColumnPresenter & { withCards: boolean }>;

export const Default: Story = {
  args: {
    title: "Open",
    count: 2,
    withCards: true,
  },
};

export const Empty: Story = {
  args: {
    title: "Open",
    count: 0,
    withCards: false,
  },
};

export const InProgress: Story = {
  args: {
    title: "In Progress",
    count: 3,
    withCards: true,
  },
};

export const Done: Story = {
  args: {
    title: "Done",
    count: 5,
    withCards: true,
  },
};
