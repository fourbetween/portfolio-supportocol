import type { RouteConfig } from "@asteasolutions/zod-to-openapi";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import {
  CommentPermissionLevelSchema,
  CommentSchema,
  CommentStatusSchema,
  CommentTypePathSchema,
  CommentTypeSchema,
  DiscussionSchema,
  ErrorSchema,
  IdSchema,
  ProjectSchema,
  RuleSchema,
  VisibilityLevelSchema,
  WorkbookSchema,
} from "./schema";

// OpenAPIRegistryのインスタンスを作成
export const registry = new OpenAPIRegistry();

// セキュリティスキーム(Bearer認証)を登録
export const cognitoAuth = registry.registerComponent(
  "securitySchemes",
  "cognito_auth",
  {
    type: "http",
    scheme: "bearer",
  }
);

// エンドポイントの定義
const routes: RouteConfig[] = [
  {
    method: "get",
    path: "/workbooks",
    description: "get workbooks",
    security: [{ [cognitoAuth.name]: [] }],
    request: {},
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: z.array(WorkbookSchema),
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "get",
    path: "/projects",
    description: "get projects",
    security: [{ [cognitoAuth.name]: [] }],
    request: {},
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: z.array(ProjectSchema),
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "get",
    path: "/projects/{projectId}",
    description: "get project",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      params: z.object({
        projectId: IdSchema,
      }),
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: ProjectSchema,
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "post",
    path: "/projects",
    description: "create project",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: ProjectSchema,
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "put",
    path: "/projects/{projectId}",
    description: "update project",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      params: z.object({
        projectId: IdSchema,
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: ProjectSchema,
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "delete",
    path: "/projects/{projectId}",
    description: "delete project",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      params: z.object({
        projectId: IdSchema,
      }),
    },
    responses: {
      204: {
        description: "success response",
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "get",
    path: "/rules",
    description: "get rules",
    security: [{ [cognitoAuth.name]: [] }],
    request: {},
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: z.array(RuleSchema),
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "get",
    path: "/rules/{ruleId}",
    description: "get rule",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      params: z.object({
        ruleId: IdSchema,
      }),
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: RuleSchema,
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "post",
    path: "/rules",
    description: "create rule",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string(),
              description: z.string(),
              commentTypes: z.array(CommentTypeSchema),
              commentTypePaths: z.array(CommentTypePathSchema),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: RuleSchema,
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "put",
    path: "/rules/{ruleId}",
    description: "update rule",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      params: z.object({
        ruleId: IdSchema,
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string(),
              description: z.string(),
              commentTypes: z.array(CommentTypeSchema),
              commentTypePaths: z.array(CommentTypePathSchema),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: RuleSchema,
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "delete",
    path: "/rules/{ruleId}",
    description: "delete rule",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      params: z.object({
        ruleId: IdSchema,
      }),
    },
    responses: {
      204: {
        description: "success response",
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "get",
    path: "/discussions",
    description: "get discussions",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      query: z.object({
        projectId: IdSchema.optional(),
      }),
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: z.array(DiscussionSchema),
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "get",
    path: "/discussions/{discussionId}",
    description: "get discussion",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: IdSchema,
      }),
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: DiscussionSchema,
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "post",
    path: "/discussions",
    description: "create discussion",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              theme: z.string(),
              background: z.string(),
              conclusion: z.string(),
              ruleId: IdSchema,
              visibilityLevel: VisibilityLevelSchema,
              commentPermissionLevel: CommentPermissionLevelSchema,
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: DiscussionSchema,
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "put",
    path: "/discussions/{discussionId}",
    description: "update discussion",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: IdSchema,
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              theme: z.string(),
              background: z.string(),
              conclusion: z.string(),
              ruleId: IdSchema,
              visibilityLevel: VisibilityLevelSchema,
              commentPermissionLevel: CommentPermissionLevelSchema,
              status: z.enum(["open", "closed", "archived"]),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: DiscussionSchema,
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "delete",
    path: "/discussions/{discussionId}",
    description: "delete discussion",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: IdSchema,
      }),
    },
    responses: {
      204: {
        description: "success response",
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "post",
    path: "/errors",
    description: "post an error",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "success response",
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "get",
    path: "/discussions/{discussionId}/comments",
    description: "get comments for a discussion",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: IdSchema,
      }),
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: z.array(CommentSchema),
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "post",
    path: "/discussions/{discussionId}/comments",
    description: "create comment",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: IdSchema,
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              parentCommentId: z.string(),
              commentTypeId: IdSchema,
              content: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: CommentSchema,
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "put",
    path: "/discussions/{discussionId}/comments/{commentId}",
    description: "update comment",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: IdSchema,
        commentId: IdSchema,
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              content: z.string(),
              status: CommentStatusSchema,
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: CommentSchema,
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
  {
    method: "delete",
    path: "/discussions/{discussionId}/comments/{commentId}",
    description: "delete comment",
    security: [{ [cognitoAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: IdSchema,
        commentId: IdSchema,
      }),
    },
    responses: {
      204: {
        description: "success response",
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  },
];

// 各ルートをregistryに動的に登録
routes.forEach((route) => registry.registerPath(route));
