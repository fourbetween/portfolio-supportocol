import type { components } from "../api/schema";
import type { Comment } from "./comment";

export type CommentFrame = components["schemas"]["CommentFrame"];

export function deriveCommentFrame(comments: Comment[]): CommentFrame {
  const types = new Set<string>();
  const paths = new Set<string>();

  const commentMap = new Map<string, Comment>();
  for (const comment of comments) {
    commentMap.set(comment.id, comment);
    types.add(comment.type);
  }

  for (const comment of comments) {
    let parentType = "";
    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parentType = parent.type;
      }
    }
    paths.add(
      JSON.stringify({
        child: comment.type,
        parent: parentType,
      }),
    );
  }

  return {
    types: Array.from(types).sort(),
    paths: Array.from(paths)
      .map((p) => JSON.parse(p))
      .sort((a, b) => {
        if (a.parent !== b.parent) {
          return a.parent.localeCompare(b.parent);
        }
        return a.child.localeCompare(b.child);
      }),
  };
}
