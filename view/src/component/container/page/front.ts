import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { client } from "../../../api/client";
import { accountMethods } from "../../../model/account";
import { baseStyle } from "../../../style/base";

@customElement("front-page-container")
export class FrontPageContainer extends LitElement {
  @property({ type: Boolean })
  isLoggedIn = false;

  private workbooksTask = new Task(this, {
    task: async ([]) => {
      const { data, error } = await client.GET("/workbooks", {
        headers: await accountMethods.authHeader(),
      });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    args: () => [],
  });

  render() {
    return html`
      ${this.workbooksTask.render({
        complete: (workbooks) => html`
          <workbook-list-presenter
            .workbooks=${workbooks}
          ></workbook-list-presenter>
        `,
      })}
    `;
  }

  static styles = [baseStyle, css``];
}
