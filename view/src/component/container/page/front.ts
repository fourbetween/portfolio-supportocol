import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { routerContext } from "../../../context/router";
import { baseStyle } from "../../../style/base";
import { navigate } from "../../../util/navigate";

@customElement("front-page-container")
export class FrontPageContainer extends LitElement {
  @consume({ context: routerContext })
  private router!: Router;

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
          <a @click=${this.handleNavigateToDashboard}>Go to Dashboard</a>
        </li>
      </ul>
    `;
  }

  private handleNavigateToDashboard = async (e: Event) => {
    e.preventDefault();
    await navigate(this.router, "/dashboard");
  };

  static styles = [baseStyle, css``];
}
