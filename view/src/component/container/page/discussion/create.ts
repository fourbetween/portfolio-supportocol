import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { client } from "../../../../api/client";
import { routerContext } from "../../../../context/router";
import { accountMethods } from "../../../../model/account";
import type { Rule } from "../../../../model/rule";
import { navigate } from "../../../../routes";
import type { CreateDiscussionFormData } from "../../../presenter/page/discussion/create";

@customElement("create-discussion-page-container")
export class CreateDiscussionPageContainer extends LitElement {
  @consume({ context: routerContext })
  @property({ attribute: false })
  router?: Router;

  @state()
  private rules: Rule[] = [];

  @state()
  private isSubmitting = false;

  constructor() {
    super();

    new Task(this, {
      task: async () => {
        const { data, error } = await client.GET("/rules", {
          headers: await accountMethods.authHeader(),
        });
        if (error) {
          throw new Error(error.message);
        }
        return data;
      },
      args: () => [],
      onComplete: (data) => {
        this.rules = data ?? [];
      },
    });
  }

  render() {
    return html`
      <create-discussion-page-presenter
        .rules=${this.rules}
        .onSubmit=${this.handleSubmit}
        .onCancel=${this.handleCancel}
      ></create-discussion-page-presenter>
    `;
  }

  private handleSubmit = async (data: CreateDiscussionFormData) => {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    try {
      const { data: discussion, error } = await client.POST("/discussions", {
        headers: await accountMethods.authHeader(),
        body: {
          theme: data.theme,
          background: data.background,
          conclusion: data.conclusion,
          ruleId: data.ruleId,
          visibilityLevel: data.visibilityLevel,
          commentPermissionLevel: data.commentPermissionLevel,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (discussion && this.router) {
        navigate(this.router, "discussion_list");
      }
    } finally {
      this.isSubmitting = false;
    }
  };

  private handleCancel = () => {
    if (this.router) {
      navigate(this.router, "discussion_list");
    }
  };
}
