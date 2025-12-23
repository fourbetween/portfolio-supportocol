import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { client } from "../../../../api/client";
import { routerContext } from "../../../../context/router";
import { showToast } from "../../../../event/toast";
import type { Rule } from "../../../../model/rule";
import { navigate } from "../../../../routes";

@customElement("edit-rule-page-container")
export class EditRulePageContainer extends LitElement {
  @consume({ context: routerContext })
  @property({ attribute: false })
  router?: Router;

  @property({ type: String })
  ruleId = "";

  @state()
  private rule?: Rule;

  @state()
  private isSubmitting = false;

  constructor() {
    super();

    new Task(this, {
      task: async ([ruleId]) => {
        if (!ruleId) {
          showToast(this, "ルールIDが必要です", "error");
          return undefined;
        }
        const { data, error } = await client.GET("/rules/{ruleId}", {
          params: { path: { ruleId } },
        });
        if (error) {
          showToast(
            this,
            `ルールの取得に失敗しました: ${error.message}`,
            "error"
          );
          return undefined;
        }
        return data;
      },
      args: () => [this.ruleId],
      onComplete: (data) => {
        if (data) {
          this.rule = data;
        }
      },
    });
  }

  render() {
    if (!this.rule) {
      return nothing;
    }

    return html`
      <edit-rule-page-presenter
        .rule=${this.rule}
        .onSave=${this.handleSave}
        .onCancel=${this.handleCancel}
      ></edit-rule-page-presenter>
    `;
  }

  private handleSave = async (rule: Rule) => {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    try {
      const { error } = await client.PUT("/rules/{ruleId}", {
        params: { path: { ruleId: this.ruleId } },
        body: {
          name: rule.name,
          description: rule.description,
          commentTypes: rule.commentTypes,
          commentTypePaths: rule.commentTypePaths,
        },
      });

      if (error) {
        showToast(
          this,
          `ルールの更新に失敗しました: ${error.message}`,
          "error"
        );
        return;
      }

      if (this.router) {
        navigate(this.router, "rule_list");
      }
    } finally {
      this.isSubmitting = false;
    }
  };

  private handleCancel = () => {
    if (this.router) {
      navigate(this.router, "rule_list");
    }
  };
}
