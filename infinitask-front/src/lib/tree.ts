export const unflatten = (items: any[]) => {
  const tree = [] as any[];
  const map = new Map();
  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  map.forEach((item) => {
    if (item.parentId) {
      const parent = map.get(item.parentId);
      if (parent) {
        parent.children.push(item);
      }
    } else {
      tree.push(item);
    }
  });
  return tree;
};

export const mapTree = (tree: any[], fn: (node: any) => any) => {
  return tree.map((node) => {
    return {
      ...fn(node),
      children: node.children ? mapTree(node.children, fn) : [],
    };
  });
};

export const findUpDown = (
  node: any,
  key: number,
  access: string
): { up: number; down: number; indexFound: number } | null => {
  if (node[access] === key) {
    return {
      up: -1,
      down: node.children.length > 0 ? node.children[0][access] : -1,
      indexFound: -1,
    };
  }

  let result = null;
  node.children.some((child: any, index: number) => {
    result = findUpDown(child, key, access, node[access]);
    if (!result) return null;

    if (result.down === -1) {
      result.down =
        index < node.children.length - 1
          ? node.children[index + 1][access]
          : -1;
    }
    if (result.up === -1) {
      result.up =
        node.children.length > 0
          ? node.children[node.children.length - 1][access]
          : node[access];
    }
    return true;
  });
  return result;
};
