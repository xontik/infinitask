export interface TreeNode<Type> {
  id: number | null;
  parent: TreeNode<Type> | null;
  children: TreeNode<Type>[];
  depth: number | null;
  data: Type;
  expanded: boolean; //TODO remove it and use clone and filter
}

export interface FlatTreeNode {
  id: number;
  parentId: number | null;
}

export const unflatten = <Type extends FlatTreeNode>(
  items: Type[]
): TreeNode<Type> => {
  const map = new Map();
  for (const item of items) {
    map.set(item.id, {
      id: item.id,
      children: [],
      parent: null,
      expanded: false,
      depth: 0,
      data: { ...item },
    });
  }

  const topLevel = {
    id: null,
    children: [] as TreeNode<Type>[],
    parent: null,
    depth: 0,
    expanded: true,
    data: {} as Type,
  } as TreeNode<Type>;
  map.forEach((item) => {
    if (item.data.parentId) {
      const parent = map.get(item.data.parentId);
      if (parent) {
        parent.children.push({ ...item, parent });
      }
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
  node.children = node.children.map((child) => addParentRelation(child, node));
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
  if (node.children.length === 0 || node.expanded === false) {
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

export const findDownInTree = <Type>(
  node: TreeNode<Type>
): TreeNode<Type> | null => {
  const { parent } = node;
  if (!parent) {
    return node.expanded === true && node.children.length > 0
      ? node.children[0]
      : null;
  }
  const index = indexInParent<Type>(node);

  if (node.expanded === true && node.children.length > 0) {
    return node.children[0];
  } else if (index < parent.children.length - 1) {
    return parent.children[index + 1];
  }
  return nextSiblingDescending<Type>(parent);
};

export const findUpDown = <Type>(
  node: TreeNode<Type>
): { up: number | null; down: number | null } => {
  return {
    up: findUpInTree<Type>(node)?.id ?? null,
    down: findDownInTree<Type>(node)?.id ?? null,
  };
};
