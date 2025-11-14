import type z from "zod";
import type {
  CommentPermissionLevelSchema,
  CommentSchema,
  CommentStatusSchema,
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

export type Issue = z.infer<typeof IssueSchema>;
export type Note = z.infer<typeof NoteSchema>;

// DiscussionCardに必要な最小限のプロパティ
export interface DiscussionCardProps {
  id: string;
  theme: string;
  authorName: string;
  authorAvatarUrl: string;
  commentCount: number;
}
