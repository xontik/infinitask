import { NEW_TASK_ID } from "@/stores/task";

export interface TreeNode<Type> {
  id: number | null;
  parent: TreeNode<Type> | null;
  children: TreeNode<Type>[];
  depth: number | null;
  data: Type;
  opened: boolean;
}

export interface FlatTreeNode {
  id: number | null;
  parentId: number | null;
  opened: boolean;
}
export const buildNode = <Type extends FlatTreeNode>(
  flatNode: Type
): TreeNode<Type> => {
  return {
    id: flatNode.id,
    parent: null,
    children: [],
    depth: null,
    data: { ...flatNode },
    opened: flatNode.opened,
  };
};
export const unflatten = <Type extends FlatTreeNode>(
  items: Map<number | null, Type>,
  exclude?: (node: TreeNode<Type>) => boolean
): TreeNode<Type> => {
  const topLevel = buildNode({
    id: null,
    parentId: null,
    opened: true,
  } as Type);

  const map = new Map<number | null, TreeNode<Type>>();
  items.forEach((item) => {
    const { id } = item;
    map.set(id, buildNode<Type>(item));
  });
  map.forEach((item) => {
    if (exclude && exclude(item)) {
      return;
    }
    const parent = map.get(item.data.parentId);
    if (parent) {
      parent.children.push(item);
    } else {
      topLevel.children.push(item);
    }
  });

  return addParentRelation(topLevel, null);
};

export const addParentRelation = <Type>(
  node: TreeNode<Type>,
  parent: TreeNode<Type> | null
): TreeNode<Type> => {
  if (parent === null) {
    node.depth = 0;
  } else {
    if (parent.depth === null) {
      throw new Error("Must start with a root node");
    }
    node.depth = parent.depth + 1;
  }
  node.parent = parent;
  node.children = node.children
    .map((child) => addParentRelation(child, node))
    .sort((a, b) => (a.id === NEW_TASK_ID ? 1 : b.id === NEW_TASK_ID ? -1 : 0));
  return node;
};
export const mapTree = <Type, NewType>(
  node: TreeNode<Type>,
  fn: (node: TreeNode<Type>) => TreeNode<NewType>
): TreeNode<NewType> => {
  return {
    ...fn(node),
    children: node.children
      ? node.children.map((item) => mapTree<Type, NewType>(item, fn))
      : [],
  };
};

export const lastChild = <Type>(node: TreeNode<Type>): TreeNode<Type> => {
  if (node.children.length === 0 || node.opened === false) {
    return node;
  } else {
    return lastChild<Type>(node.children[node.children.length - 1]);
  }
};
export const indexInParent = <Type>(node: TreeNode<Type>): number => {
  if (!node.parent) {
    throw new Error("node has no parent");
  }
  const index = node.parent.children.findIndex((child) => child.id === node.id);
  if (index === -1) {
    throw new Error("child not found in parent");
  }
  return index;
};

export const nextSiblingDescending = <Type>(
  node: TreeNode<Type>
): TreeNode<Type> | null => {
  const { parent } = node;
  if (!parent) {
    return null;
  }
  const index = indexInParent<Type>(node);
  if (index === parent.children.length - 1) {
    return nextSiblingDescending<Type>(parent);
  }
  return parent.children[index + 1];
};
export const findUpInTree = <Type>(
  node: TreeNode<Type>
): TreeNode<Type> | null => {
  const { parent } = node;

  if (!parent) {
    return null;
  }

  const index = indexInParent<Type>(node);
  if (index === 0) {
    return parent;
  } else {
    return lastChild(parent.children[index - 1]);
  }
};
export const applyToAllChildren = <Type>(
  node: TreeNode<Type>,
  fn: (node: TreeNode<Type>) => void
) => {
  fn(node);
  node.children.forEach((child) => applyToAllChildren(child, fn));
};
export const findDownInTree = <Type>(
  node: TreeNode<Type>
): TreeNode<Type> | null => {
  const { parent } = node;
  if (!parent) {
    return node.opened === true && node.children.length > 0
      ? node.children[0]
      : null;
  }
  const index = indexInParent<Type>(node);

  if (node.opened === true && node.children.length > 0) {
    return node.children[0];
  } else if (index < parent.children.length - 1) {
    return parent.children[index + 1];
  }
  return nextSiblingDescending<Type>(parent);
};

export const findInTree = <Type>(
  node: TreeNode<Type>,
  id: number | null
): TreeNode<Type> | null => {
  if (node.id === id) {
    return node;
  }
  for (const child of node.children) {
    const found = findInTree<Type>(child, id);
    if (found) {
      return found;
    }
  }
  return null;
};

export const findUpDown = <Type>(
  node: TreeNode<Type>
): { up: number | null; down: number | null } => {
  return {
    up: findUpInTree<Type>(node)?.id ?? null,
    down: findDownInTree<Type>(node)?.id ?? null,
  };
};
