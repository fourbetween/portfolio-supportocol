import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";

@customElement("front-page-container")
export class FrontPageContainer extends LitElement {
  @property({ type: Boolean })
  isLoggedIn = false;

  // private workbooksTask = new Task(this, {
  //   task: async ([]) => {
  //     const { data, error } = await client.GET("/workbooks", {
  //       headers: await accountMethods.authHeader(),
  //     });
  //     if (error) {
  //       throw new Error(error.message);
  //     }
  //     return data;
  //   },
  //   args: () => [],
  // });

  render() {
    return html`
      <ul>
        <li>
          <a href="/dashboard">Go to Dashboard</a>
        </li>
      </ul>
    `;
  }

  static styles = [baseStyle, css``];
}
