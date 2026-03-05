import type { components } from "../api/schema";
import type { Comment } from "./comment";

export type CommentFrame = components["schemas"]["CommentFrame"];

export function sortCommentFrame(
  frame: CommentFrame,
  comments: Comment[],
): CommentFrame {
  const commentMap = new Map<string, Comment>();
  const depthMap = new Map<string, number>();

  for (const comment of comments) {
    commentMap.set(comment.id, comment);
  }

  const getDepth = (commentId: string): number => {
    if (depthMap.has(commentId)) {
      return depthMap.get(commentId)!;
    }
    const comment = commentMap.get(commentId);
    if (!comment || !comment.parentCommentId) {
      depthMap.set(commentId, 0);
      return 0;
    }
    const depth = getDepth(comment.parentCommentId) + 1;
    depthMap.set(commentId, depth);
    return depth;
  };

  const typeMinDepth = new Map<string, number>();
  for (const comment of comments) {
    const depth = getDepth(comment.id);
    const currentMin = typeMinDepth.get(comment.type) ?? Infinity;
    if (depth < currentMin) {
      typeMinDepth.set(comment.type, depth);
    }
  }

  const pathMinDepth = new Map<string, number>();
  for (const path of frame.paths) {
    const key = JSON.stringify(path);
    let minDepth = Infinity;
    for (const comment of comments) {
      if (comment.type === path.child) {
        let parentType = "";
        if (comment.parentCommentId) {
          const parent = commentMap.get(comment.parentCommentId);
          if (parent) {
            parentType = parent.type;
          } else {
            continue;
          }
        }
        if (parentType === path.parent) {
          minDepth = Math.min(minDepth, getDepth(comment.id));
        }
      }
    }
    pathMinDepth.set(key, minDepth);
  }

  return {
    types: [...frame.types].sort((a, b) => {
      const depthA = typeMinDepth.get(a) ?? Infinity;
      const depthB = typeMinDepth.get(b) ?? Infinity;
      if (depthA !== depthB) {
        return depthA - depthB;
      }
      return a.localeCompare(b);
    }),
    paths: [...frame.paths].sort((a, b) => {
      const depthA = pathMinDepth.get(JSON.stringify(a)) ?? Infinity;
      const depthB = pathMinDepth.get(JSON.stringify(b)) ?? Infinity;
      if (depthA !== depthB) {
        return depthA - depthB;
      }
      if (a.parent !== b.parent) {
        return a.parent.localeCompare(b.parent);
      }
      return a.child.localeCompare(b.child);
    }),
  };
}
