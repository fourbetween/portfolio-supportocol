import type z from "zod";
import type {
  CommentPermissionLevelSchema,
  CommentSchema,
  CommentStatusSchema,
  CommentTypeSchema,
  DiscussionSchema,
  IssueSchema,
  NoteSchema,
  VisibilityLevelSchema,
} from "../api/schema/schema";

export type Discussion = z.infer<typeof DiscussionSchema>;
export type VisibilityLevel = z.infer<typeof VisibilityLevelSchema>;
export type CommentPermissionLevel = z.infer<
  typeof CommentPermissionLevelSchema
>;

export type Comment = z.infer<typeof CommentSchema>;
export type CommentStatus = z.infer<typeof CommentStatusSchema>;
export type CommentType = z.infer<typeof CommentTypeSchema>;

export type Issue = z.infer<typeof IssueSchema>;
export type Note = z.infer<typeof NoteSchema>;
