import type z from "zod";
import type {
  CommentTypePathSchema,
  CommentTypeSchema,
  RuleSchema,
} from "../api/schema/schema";

export type Rule = z.infer<typeof RuleSchema>;
export type CommentType = z.infer<typeof CommentTypeSchema>;
export type CommentTypePath = z.infer<typeof CommentTypePathSchema>;
