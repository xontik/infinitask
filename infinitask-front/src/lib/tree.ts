export interface Tree {
  map: Map;
  tree: any;
}

export const unflatten = (items: any[]): Tree => {
  const map = new Map();
  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  const topLevel = {
    id: null,
    children: [],
    parentId: null,
  };
  map.forEach((item) => {
    if (item.parentId) {
      const parent = map.get(item.parentId);
      if (parent) {
        parent.children.push({ ...item });
      }
    } else {
      topLevel.children.push(item);
    }
  });

  return addParentRelation(topLevel, null);
};
export const addParentRelation = (node: any, parent: any) => {
  node.parent = parent;
  node.children = node.children.map((child) => addParentRelation(child, node));
  return node;
};
export const mapTree = (node, fn: (node: any) => any) => {
  return {
    ...fn(node),
    children: node.children
      ? node.children.map((item) => mapTree(item, fn))
      : [],
  };
};

export const lastChild = (node: any) => {
  if (node.children.length === 0 || node.expanded === false) {
    return node;
  } else {
    return lastChild(node.children[node.children.length - 1]);
  }
};

export const nextSiblingDescending = (node: any) => {
  const { parent } = node;
  if (!parent) {
    return null;
  }
  const indexInParent = parent.children.findIndex(
    (child) => child.id === node.id
  );
  if (indexInParent === -1) {
    throw new Error("indexInParent is undefined");
  }
  if (indexInParent === parent.children.length - 1) {
    return nextSiblingDescending(parent);
  }
  return parent.children[indexInParent + 1];
};

export const findUpDown = (
  node: TaskNode
): { up: number; down: number } | null => {
  let up = null;
  let down = null;

  const { parent } = node;

  if (!parent) {
    if (node.expanded === true && node.children.length > 0) {
      down = node.children[0].id;
    }
    return { up, down };
  }

  const indexInParent = parent?.children.findIndex(
    (child) => child.id === node.id
  );

  if (indexInParent === -1) {
    throw new Error("indexInParent is undefined");
  }

  if (indexInParent === 0) {
    up = parent.id;
  } else {
    up = lastChild(parent.children[indexInParent - 1]).id;
  }
  if (node.expanded === true && node.children.length > 0) {
    down = node.children[0].id;
  } else if (indexInParent < parent.children.length - 1) {
    down = parent.children[indexInParent + 1].id;
  } else {
    down = nextSiblingDescending(parent)?.id || null;
  }
  return { up, down };
};
