import type { Comment } from "./comment";

export type CommentFrame = {
  types: string[];
  paths: Array<{ child: string; parent: string }>;
};

export function deriveCommentFrame(comments: Comment[]): CommentFrame {
  const types = new Set<string>();
  const paths = new Set<string>();

  const commentMap = new Map<string, Comment>();
  for (const comment of comments) {
    commentMap.set(comment.id, comment);
    types.add(comment.commentType);
  }

  for (const comment of comments) {
    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        paths.add(
          JSON.stringify({
            child: comment.commentType,
            parent: parent.commentType,
          })
        );
      }
    }
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
