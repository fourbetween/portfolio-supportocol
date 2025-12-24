import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const idSchema = z.string().min(36).max(36).openapi("Id");

export const ErrorSchema = z
  .object({
    code: z.number().int().min(100).max(599),
    message: z.string(),
  })
  .openapi("Error");

export const UserSchema = z
  .object({
    id: z.string(),
    email: z.string().openapi({ format: "email" }),
    name: z.string(),
  })
  .openapi("User");

export const VisibilityLevelSchema = z
  .enum(["everyone", "authenticated", "owner"])
  .openapi("VisibilityLevel");

export const CommentPermissionLevelSchema = z
  .enum(["everyone", "authenticated", "owner"])
  .openapi("CommentPermissionLevel");

export const DiscussionSchema = z
  .object({
    id: idSchema,
    theme: z.string(),
    background: z.string(),
    conclusion: z.string(),
    ruleId: idSchema,
    visibilityLevel: VisibilityLevelSchema,
    commentPermissionLevel: CommentPermissionLevelSchema,
    createdBy: z.string(),
    createdAt: z.string().openapi({ format: "date-time" }),
    status: z.enum(["open", "closed", "archived"]),
  })
  .openapi("Discussion");

export const CommentStatusSchema = z
  .enum(["unassigned", "assigned", "archived", "deleted"])
  .openapi("CommentStatus");

export const CommentSchema = z
  .object({
    id: idSchema,
    discussionId: idSchema,
    parentCommentId: idSchema,
    commentTypeId: idSchema,
    content: z.string(),
    postedBy: z.string(),
    createdAt: z.string().openapi({ format: "date-time" }),
    status: CommentStatusSchema,
  })
  .openapi("Comment");

export const IssueSchema = z
  .object({
    id: idSchema,
    commentId: idSchema,
    issueType: z.enum(["contradiction", "circular_logic"]),
    description: z.string(),
    createdBy: z.string(),
    createdAt: z.string().openapi({ format: "date-time" }),
  })
  .openapi("Issue");

export const NoteSchema = z
  .object({
    id: idSchema,
    discussionId: idSchema,
    content: z.string(),
    postedBy: z.string(),
    createdAt: z.string().openapi({ format: "date-time" }),
  })
  .openapi("Note");

export const CommentTypeSchema = z
  .object({
    id: idSchema,
    no: z.number().int().min(0),
    name: z.string(),
    description: z.string(),
    color: z.string(),
    root: z.boolean(),
  })
  .openapi("CommentType");

export const CommentTypePathSchema = z
  .object({
    childCommentTypeId: idSchema,
    parentCommentTypeId: idSchema,
  })
  .openapi("CommentTypePath");

export const RuleSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    description: z.string(),
    createdBy: z.string(),
    createdAt: z.string().openapi({ format: "date-time" }),
    commentTypes: z.array(CommentTypeSchema),
    commentTypePaths: z.array(CommentTypePathSchema),
  })
  .openapi("Rule");

export const ProjectSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    createdBy: z.string(),
    createdAt: z.string().openapi({ format: "date-time" }),
  })
  .openapi("Project");

export const GoogleLoginRequestSchema = z
  .object({
    idToken: z.string(),
  })
  .openapi("GoogleLoginRequest");
