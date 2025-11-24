import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Component schemas
export const IdSchema = z.string().min(26).max(26).openapi("id");

export const StatusSchema = z.enum(["draft", "published"]).openapi("status");

export const WorkbookSchema = z
  .object({
    id: IdSchema,
    title: z.string(),
    status: StatusSchema,
    ownerId: IdSchema,
  })
  .openapi("workbook");

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
    id: IdSchema,
    theme: z.string(),
    background: z.string(),
    conclusion: z.string(),
    ruleId: IdSchema,
    visibilityLevel: VisibilityLevelSchema,
    commentPermissionLevel: CommentPermissionLevelSchema,
    createdBy: IdSchema,
    createdAt: z.string().openapi({ format: "date-time" }),
    status: z.enum(["open", "closed", "archived"]),
  })
  .openapi("discussion");

export const CommentStatusSchema = z
  .enum(["unassigned", "assigned", "archived", "deleted"])
  .openapi("commentStatus");

export const CommentSchema = z
  .object({
    id: IdSchema,
    discussionId: IdSchema,
    parentCommentId: IdSchema.nullable(),
    commentTypeId: IdSchema,
    content: z.string(),
    postedBy: IdSchema,
    postedAt: z.string().openapi({ format: "date-time" }),
    status: CommentStatusSchema,
  })
  .openapi("comment");

export const IssueSchema = z
  .object({
    id: IdSchema,
    commentId: IdSchema,
    issueType: z.enum(["contradiction", "circular_logic"]),
    description: z.string(),
    createdBy: IdSchema,
    createdAt: z.string().openapi({ format: "date-time" }),
  })
  .openapi("issue");

export const NoteSchema = z
  .object({
    id: IdSchema,
    discussionId: IdSchema,
    content: z.string(),
    postedBy: IdSchema,
    postedAt: z.string().openapi({ format: "date-time" }),
  })
  .openapi("note");

export const CommentTypeSchema = z
  .object({
    id: IdSchema,
    ruleId: IdSchema,
    name: z.string(),
    description: z.string(),
    color: z.string(),
  })
  .openapi("commentType");

export const CommentTypePathSchema = z
  .object({
    fromCommentTypeId: IdSchema,
    toCommentTypeId: IdSchema,
  })
  .openapi("commentTypePath");

export const RuleSchema = z
  .object({
    id: IdSchema,
    name: z.string(),
    description: z.string(),
    createdBy: IdSchema,
    createdAt: z.string().openapi({ format: "date-time" }),
    commentTypes: z.array(CommentTypeSchema),
    commentTypePaths: z.array(CommentTypePathSchema),
  })
  .openapi("rule");

export const ProjectSchema = z
  .object({
    id: IdSchema,
    name: z.string(),
    createdBy: IdSchema,
    createdAt: z.string().openapi({ format: "date-time" }),
  })
  .openapi("project");
