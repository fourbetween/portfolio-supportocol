import { Task } from "@lit/task";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { client } from "../../../../api/client";
import { accountMethods } from "../../../../model/account";
import type { Rule } from "../../../../model/rule";
import { baseStyle } from "../../../../style/base";
import type { CreateDiscussionFormData } from "../../../presenter/page/discussion/create";

@customElement("create-discussion-page-container")
export class CreateDiscussionPageContainer extends LitElement {
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

      if (discussion) {
        window.location.href = `/discussions/${discussion.id}`;
      }
    } finally {
      this.isSubmitting = false;
    }
  };

  private handleCancel = () => {
    window.location.href = "/discussions";
  };

  static styles = [baseStyle];
}
