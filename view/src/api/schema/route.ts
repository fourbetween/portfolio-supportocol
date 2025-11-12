import type { RouteConfig } from "@asteasolutions/zod-to-openapi";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  DefaultErrorResponseSchema,
  GetWorkbooksResponseSchema,
  PostErrorRequestSchema,
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
            schema: GetWorkbooksResponseSchema,
          },
        },
      },
      default: {
        description: "default error",
        content: {
          "application/json": {
            schema: DefaultErrorResponseSchema,
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
            schema: PostErrorRequestSchema,
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
            schema: DefaultErrorResponseSchema,
          },
        },
      },
    },
  },
];

// 各ルートをregistryに動的に登録
routes.forEach((route) => registry.registerPath(route));
