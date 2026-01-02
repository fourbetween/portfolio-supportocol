import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./popup";
import type { Popup } from "./popup";

const meta: Meta = {
  title: "shared/ui/popup",
  component: "ui-popup",
  render: (args) => {
    const open = () => {
      const popup = document.querySelector("ui-popup") as Popup;
      popup.open = true;
    };
    return html`
      <button @click=${open}>Open Popup</button>
      <ui-popup>
        <div slot="header">${args.header}</div>
        <div slot="main">${args.main}</div>
        ${args.footer
          ? html`
              <div slot="footer">${args.footer}</div>
            `
          : ""}
      </ui-popup>
    `;
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    header: "Popup Header",
    main: "This is the main content of the popup.",
    footer: "Footer Content",
  },
};

export const NoFooter: Story = {
  args: {
    header: "Popup Header",
    main: "This popup has no footer. The footer area should be hidden.",
    footer: "",
  },
};
