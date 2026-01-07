import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./drawer";

const meta: Meta = {
  title: "shared/ui/drawer",
  component: "shared-ui-drawer",
  argTypes: {
    open: { control: "boolean" },
  },
};

export default meta;

export const Default: StoryObj = {
  render: (args) => {
    const updateOpen = (val: boolean) => {
      args.open = val;
      const el = document.querySelector("ui-drawer");
      if (el) {
        (el as any).open = val;
      }
    };

    return html`
      <button @click=${() => updateOpen(true)}>Open Drawer</button>
      <ui-drawer .open=${args.open} @close=${() => updateOpen(false)}>
        <div slot="header">Drawer Header</div>
        <div>
          <p>This is the drawer content.</p>
          <p>You can put anything here.</p>
        </div>
      </ui-drawer>
    `;
  },
  args: {
    open: true,
  },
};
