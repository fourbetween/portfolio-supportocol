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
    status: z.string(),
  })
  .openapi("workbook");

export const ErrorSchema = z
  .object({
    code: z.number().int().min(100).max(599),
    message: z.string(),
  })
  .openapi("error");

// Discussion schemas
export const VisibilityLevelSchema = z
  .enum(["everyone", "logged_in", "owner", "group"])
  .openapi("visibilityLevel");

export const CommentPermissionLevelSchema = z
  .enum(["everyone", "logged_in", "owner", "group"])
  .openapi("commentPermissionLevel");

export const DiscussionSchema = z
  .object({
    id: IdSchema,
    theme: z.string(),
    background: z.string(),
    ruleId: IdSchema,
    visibilityLevel: VisibilityLevelSchema,
    commentPermissionLevel: CommentPermissionLevelSchema,
    groupId: IdSchema.nullable(),
    createdBy: IdSchema,
    createdAt: z.string().datetime(),
  })
  .openapi("discussion");

export const CommentStatusSchema = z
  .enum(["pending", "assigned", "archived", "deleted"])
  .openapi("commentStatus");

export const CommentSchema = z
  .object({
    id: IdSchema,
    discussionId: IdSchema,
    parentCommentId: IdSchema.nullable(),
    commentTypeId: IdSchema,
    content: z.string(),
    postedBy: IdSchema,
    postedAt: z.string().datetime(),
    status: CommentStatusSchema,
  })
  .openapi("comment");

export const GroupSchema = z
  .object({
    id: IdSchema,
    name: z.string(),
    description: z.string(),
    createdBy: IdSchema,
    createdAt: z.string().datetime(),
  })
  .openapi("group");

export const GroupMemberSchema = z
  .object({
    groupId: IdSchema,
    userId: IdSchema,
    joinedAt: z.string().datetime(),
  })
  .openapi("groupMember");

export const IssueSchema = z
  .object({
    id: IdSchema,
    commentId: IdSchema,
    issueType: z.string(),
    description: z.string(),
    createdBy: IdSchema,
    createdAt: z.string().datetime(),
  })
  .openapi("issue");

export const NoteSchema = z
  .object({
    id: IdSchema,
    discussionId: IdSchema,
    content: z.string(),
    postedBy: IdSchema,
    postedAt: z.string().datetime(),
  })
  .openapi("note");

export const RuleSchema = z
  .object({
    id: IdSchema,
    name: z.string(),
    description: z.string(),
    createdBy: IdSchema,
    createdAt: z.string().datetime(),
  })
  .openapi("rule");

export const CommentTypeSchema = z
  .object({
    id: IdSchema,
    ruleId: IdSchema,
    name: z.string(),
    description: z.string(),
  })
  .openapi("commentType");

export const CommentTypePathSchema = z
  .object({
    id: IdSchema,
    ruleId: IdSchema,
    fromCommentTypeId: IdSchema,
    toCommentTypeId: IdSchema,
  })
  .openapi("commentTypePath");
