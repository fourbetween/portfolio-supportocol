import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const ErrorSchema = z
  .object({
    code: z.number().int().min(100).max(599),
    message: z.string(),
  })
  .openapi("error");

export const VisibilityLevelSchema = z
  .enum(["everyone", "authenticated", "owner"])
  .openapi("visibilityLevel");

export const CommentPermissionLevelSchema = z
  .enum(["everyone", "authenticated", "owner"])
  .openapi("commentPermissionLevel");

export const DiscussionSchema = z
  .object({
    id: z.string(),
    theme: z.string(),
    background: z.string(),
    conclusion: z.string(),
    ruleId: z.string(),
    visibilityLevel: VisibilityLevelSchema,
    commentPermissionLevel: CommentPermissionLevelSchema,
    createdBy: z.string(),
    createdAt: z.string().openapi({ format: "date-time" }),
    status: z.enum(["open", "closed", "archived"]),
  })
  .openapi("discussion");

export const CommentStatusSchema = z
  .enum(["unassigned", "assigned", "archived", "deleted"])
  .openapi("commentStatus");

export const CommentSchema = z
  .object({
    id: z.string(),
    discussionId: z.string(),
    parentCommentId: z.string(),
    commentTypeId: z.string(),
    content: z.string(),
    postedBy: z.string(),
    postedAt: z.string().openapi({ format: "date-time" }),
    status: CommentStatusSchema,
  })
  .openapi("comment");

export const IssueSchema = z
  .object({
    id: z.string(),
    commentId: z.string(),
    issueType: z.enum(["contradiction", "circular_logic"]),
    description: z.string(),
    createdBy: z.string(),
    createdAt: z.string().openapi({ format: "date-time" }),
  })
  .openapi("issue");

export const NoteSchema = z
  .object({
    id: z.string(),
    discussionId: z.string(),
    content: z.string(),
    postedBy: z.string(),
    postedAt: z.string().openapi({ format: "date-time" }),
  })
  .openapi("note");

export const CommentTypeSchema = z
  .object({
    id: z.string(),
    no: z.number().int().min(0),
    name: z.string(),
    description: z.string(),
    color: z.string(),
  })
  .openapi("commentType");

export const CommentTypePathSchema = z
  .object({
    childCommentTypeId: z.string(),
    parentCommentTypeId: z.string(),
  })
  .openapi("commentTypePath");

export const RuleSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    createdBy: z.string(),
    createdAt: z.string().openapi({ format: "date-time" }),
    commentTypes: z.array(CommentTypeSchema),
    commentTypePaths: z.array(CommentTypePathSchema),
  })
  .openapi("rule");

export const ProjectSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    createdBy: z.string(),
    createdAt: z.string().openapi({ format: "date-time" }),
  })
  .openapi("project");
