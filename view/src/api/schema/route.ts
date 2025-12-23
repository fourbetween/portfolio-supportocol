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
  GoogleLoginRequestSchema,
  IssueSchema,
  NoteSchema,
  ProjectSchema,
  RuleSchema,
  UserSchema,
  VisibilityLevelSchema,
} from "./schema";

// OpenAPIRegistryのインスタンスを作成
export const registry = new OpenAPIRegistry();

// セキュリティスキーム(Cookie認証)を登録
export const cookieAuth = registry.registerComponent(
  "securitySchemes",
  "cookie_auth",
  {
    type: "apiKey",
    in: "cookie",
    name: "auth_token",
  }
);

const defaultResponse = {
  description: "default error",
  content: {
    "application/json": {
      schema: ErrorSchema,
    },
  },
};

// エンドポイントの定義
const routes: RouteConfig[] = [
  {
    method: "post",
    path: "/auth/google",
    description: "google login",
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: GoogleLoginRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "success response",
      },
      default: defaultResponse,
    },
  },
  {
    method: "post",
    path: "/auth/logout",
    description: "logout",
    responses: {
      200: {
        description: "success response",
      },
      default: defaultResponse,
    },
  },
  {
    method: "get",
    path: "/me",
    description: "get current user",
    security: [{ [cookieAuth.name]: [] }],
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: UserSchema,
          },
        },
      },
      default: defaultResponse,
    },
  },
  {
    method: "post",
    path: "/errors",
    description: "post an error",
    security: [{ [cookieAuth.name]: [] }],
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
      default: defaultResponse,
    },
  },
  {
    method: "get",
    path: "/projects",
    description: "get projects",
    security: [{ [cookieAuth.name]: [] }],
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
      default: defaultResponse,
    },
  },
  {
    method: "get",
    path: "/projects/{projectId}",
    description: "get project",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        projectId: z.string(),
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
      default: defaultResponse,
    },
  },
  {
    method: "post",
    path: "/projects",
    description: "create project",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      body: {
        required: true,
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
      default: defaultResponse,
    },
  },
  {
    method: "put",
    path: "/projects/{projectId}",
    description: "update project",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        projectId: z.string(),
      }),
      body: {
        required: true,
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
      default: defaultResponse,
    },
  },
  {
    method: "delete",
    path: "/projects/{projectId}",
    description: "delete project",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        projectId: z.string(),
      }),
    },
    responses: {
      204: {
        description: "success response",
      },
      default: defaultResponse,
    },
  },
  {
    method: "get",
    path: "/rules",
    description: "get rules",
    security: [{ [cookieAuth.name]: [] }],
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
      default: defaultResponse,
    },
  },
  {
    method: "get",
    path: "/rules/{ruleId}",
    description: "get rule",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        ruleId: z.string(),
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
      default: defaultResponse,
    },
  },
  {
    method: "post",
    path: "/rules",
    description: "create rule",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      body: {
        required: true,
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
      default: defaultResponse,
    },
  },
  {
    method: "put",
    path: "/rules/{ruleId}",
    description: "update rule",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        ruleId: z.string(),
      }),
      body: {
        required: true,
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
      default: defaultResponse,
    },
  },
  {
    method: "delete",
    path: "/rules/{ruleId}",
    description: "delete rule",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        ruleId: z.string(),
      }),
    },
    responses: {
      204: {
        description: "success response",
      },
      default: defaultResponse,
    },
  },
  {
    method: "get",
    path: "/discussions",
    description: "get discussions",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      query: z.object({
        projectId: z.string().optional(),
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
      default: defaultResponse,
    },
  },
  {
    method: "get",
    path: "/discussions/{discussionId}",
    description: "get discussion",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
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
      default: defaultResponse,
    },
  },
  {
    method: "post",
    path: "/discussions",
    description: "create discussion",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              theme: z.string(),
              background: z.string(),
              conclusion: z.string(),
              ruleId: z.string(),
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
      default: defaultResponse,
    },
  },
  {
    method: "put",
    path: "/discussions/{discussionId}",
    description: "update discussion",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              theme: z.string(),
              background: z.string(),
              conclusion: z.string(),
              ruleId: z.string(),
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
      default: defaultResponse,
    },
  },
  {
    method: "delete",
    path: "/discussions/{discussionId}",
    description: "delete discussion",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
      }),
    },
    responses: {
      204: {
        description: "success response",
      },
      default: defaultResponse,
    },
  },
  {
    method: "get",
    path: "/discussions/{discussionId}/comments",
    description: "get comments for a discussion",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
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
      default: defaultResponse,
    },
  },
  {
    method: "post",
    path: "/discussions/{discussionId}/comments",
    description: "create comment",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              parentCommentId: z.string(),
              commentTypeId: z.string(),
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
      default: defaultResponse,
    },
  },
  {
    method: "put",
    path: "/discussions/{discussionId}/comments/{commentId}",
    description: "update comment",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
        commentId: z.string(),
      }),
      body: {
        required: true,
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
      default: defaultResponse,
    },
  },
  {
    method: "delete",
    path: "/discussions/{discussionId}/comments/{commentId}",
    description: "delete comment",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
        commentId: z.string(),
      }),
    },
    responses: {
      204: {
        description: "success response",
      },
      default: defaultResponse,
    },
  },

  // Issue endpoints
  {
    method: "get",
    path: "/discussions/{discussionId}/issues",
    description: "get issues for a discussion",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
      }),
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: z.array(IssueSchema),
          },
        },
      },
      default: defaultResponse,
    },
  },
  {
    method: "post",
    path: "/discussions/{discussionId}/issues",
    description: "create issue",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              commentId: z.string(),
              issueType: z.enum(["contradiction", "circular_logic"]),
              description: z.string(),
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
            schema: IssueSchema,
          },
        },
      },
      default: defaultResponse,
    },
  },
  {
    method: "put",
    path: "/discussions/{discussionId}/issues/{issueId}",
    description: "update issue",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
        issueId: z.string(),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              issueType: z.enum(["contradiction", "circular_logic"]),
              description: z.string(),
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
            schema: IssueSchema,
          },
        },
      },
      default: defaultResponse,
    },
  },
  {
    method: "delete",
    path: "/discussions/{discussionId}/issues/{issueId}",
    description: "delete issue",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
        issueId: z.string(),
      }),
    },
    responses: {
      204: {
        description: "success response",
      },
      default: defaultResponse,
    },
  },

  // Note endpoints
  {
    method: "get",
    path: "/discussions/{discussionId}/notes",
    description: "get notes for a discussion",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
      }),
    },
    responses: {
      200: {
        description: "success response",
        content: {
          "application/json": {
            schema: z.array(NoteSchema),
          },
        },
      },
      default: defaultResponse,
    },
  },
  {
    method: "post",
    path: "/discussions/{discussionId}/notes",
    description: "create note",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
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
            schema: NoteSchema,
          },
        },
      },
      default: defaultResponse,
    },
  },
  {
    method: "put",
    path: "/discussions/{discussionId}/notes/{noteId}",
    description: "update note",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
        noteId: z.string(),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
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
            schema: NoteSchema,
          },
        },
      },
      default: defaultResponse,
    },
  },
  {
    method: "delete",
    path: "/discussions/{discussionId}/notes/{noteId}",
    description: "delete note",
    security: [{ [cookieAuth.name]: [] }],
    request: {
      params: z.object({
        discussionId: z.string(),
        noteId: z.string(),
      }),
    },
    responses: {
      204: {
        description: "success response",
      },
      default: defaultResponse,
    },
  },
];

// 各ルートをregistryに動的に登録
routes.forEach((route) => registry.registerPath(route));
