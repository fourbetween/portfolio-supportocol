import type { components } from "../api/schema";
import type { Comment } from "./comment";

export type CommentFrame = components["schemas"]["CommentFrame"];

export function renameCommentFrameType(
  frame: CommentFrame,
  oldType: string,
  newType: string,
): CommentFrame {
  const types: string[] = [];
  const seenTypes = new Set<string>();

  for (const type of frame.types) {
    const replaced = type === oldType ? newType : type;
    if (!seenTypes.has(replaced)) {
      seenTypes.add(replaced);
      types.push(replaced);
    }
  }

  const paths: CommentFrame["paths"] = [];
  const seenPaths = new Set<string>();

  for (const path of frame.paths) {
    const replacedPath = {
      child: path.child === oldType ? newType : path.child,
      parent: path.parent === oldType ? newType : path.parent,
    };
    const key = `${replacedPath.parent}->${replacedPath.child}`;
    if (!seenPaths.has(key)) {
      seenPaths.add(key);
      paths.push(replacedPath);
    }
  }

  return { types, paths };
}

export function deriveCommentFrame(comments: Comment[]): CommentFrame {
  const types = new Set<string>();
  const paths = new Set<string>();

  const commentMap = new Map<string, Comment>();
  const depthMap = new Map<string, number>();

  for (const comment of comments) {
    commentMap.set(comment.id, comment);
    types.add(comment.type);
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

  const pathMinDepth = new Map<string, number>();
  const pathList = Array.from(paths).map(
    (p) => JSON.parse(p) as { child: string; parent: string },
  );
  for (const path of pathList) {
    const key = JSON.stringify(path);
    let minDepth = Infinity;
    for (const comment of comments) {
      if (comment.type === path.child) {
        let parentType = "";
        if (comment.parentCommentId) {
          const parent = commentMap.get(comment.parentCommentId);
          if (parent) {
            parentType = parent.type;
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
    types: Array.from(types).sort((a, b) => {
      const depthA = typeMinDepth.get(a) ?? 0;
      const depthB = typeMinDepth.get(b) ?? 0;
      if (depthA !== depthB) {
        return depthA - depthB;
      }
      return a.localeCompare(b);
    }),
    paths: pathList.sort((a, b) => {
      const depthA = pathMinDepth.get(JSON.stringify(a)) ?? 0;
      const depthB = pathMinDepth.get(JSON.stringify(b)) ?? 0;
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
