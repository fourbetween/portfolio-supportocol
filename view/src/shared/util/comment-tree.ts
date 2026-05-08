export interface TreeNode {
  id: string;
  type: string;
  parentCommentId: string | null;
}

/**
 * Builds a map of parentId -> sorted children comments.
 * Root comments (parentCommentId is null or references a missing comment)
 * are grouped under the key "root".
 * Siblings are sorted by `type` in ascending alphabetical order.
 */
export function buildSortedChildrenMap<T extends TreeNode>(
  comments: readonly T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  const commentIds = new Set(comments.map((c) => c.id));
  const sortedComments = [...comments].sort((a, b) =>
    a.type.localeCompare(b.type),
  );
  for (const comment of sortedComments) {
    const parentId =
      comment.parentCommentId && commentIds.has(comment.parentCommentId)
        ? comment.parentCommentId
        : "root";
    const children = map.get(parentId) || [];
    children.push(comment);
    map.set(parentId, children);
  }
  return map;
}
