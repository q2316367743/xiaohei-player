import {type TreeOptionData } from "tdesign-vue-next";

interface TreeNode extends TreeOptionData {
  value: string | number;
  label: string;
  icon?: "global" | "connection" | "folder" | "file";
  children?: TreeNode[];
  _source?: any;
}

interface ListToTreeOptions<T> {
  idKey?: string; // 列表中表示节点ID的字段名，默认 'id'
  parentIdKey?: string; // 列表中表示父节点ID的字段名，默认 'parentId'
  labelKey?: string; // 列表中表示显示文本的字段名，默认 'label'
  handle?: (node: T) => Partial<TreeNode>; // 自定义处理节点的函数，返回一个对象，对象中的属性会覆盖默认的属性
  /**
   * 根节点的ID，默认为 空字符串
   */
  rootNodeId?: string | null | undefined;
}

export class ListToTree<T extends Record<string, any>> {
  private readonly idKey: string;
  private readonly parentIdKey: string;
  private readonly labelKey: string;
  private readonly handle: (node: T) => Partial<TreeNode>;
  private readonly rootNodeId: string | null | undefined;

  constructor(options: ListToTreeOptions<T> = {}) {
    this.idKey = options.idKey || "id";
    this.parentIdKey = options.parentIdKey || "parentId";
    this.labelKey = options.labelKey || "label";
    this.handle = options.handle || (() => ({}));
    this.rootNodeId = options.rootNodeId;
  }

  /**
   * 将扁平列表转换为树形结构
   * @param list 扁平数据列表
   * @returns 树形结构数组
   */
  transform(list: T[]): TreeNode[] {
    if (!Array.isArray(list)) {
      throw new Error("Input must be an array");
    }
    if (list.length === 0) return [];

    const tree: TreeNode[] = [];
    const map = new Map<any, TreeNode>();

    // 第一步：先将所有节点初始化为树节点，并用 map 存储引用
    list.forEach((item) => {
      const id = item[this.idKey];
      // const parentId = item[this.parentIdKey];
      const label = item[this.labelKey] ?? String(id);

      map.set(id, {
        ...this.handle(item),
        value: id,
        label: String(label),
        children: []
      });
    });

    // 第二步：建立父子关系
    list.forEach((item) => {
      const id = item[this.idKey];
      const parentId = item[this.parentIdKey];
      const node = map.get(id);

      if (node) {
        if (parentId === this.rootNodeId) {
          // 根节点
          tree.push(node);
        } else {
          const parent = map.get(parentId);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(node);
          }
        }
      }
    });

    // 过滤掉空的 children 数组
    const cleanChildren = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.children && node.children.length > 0) {
          node.children = cleanChildren(node.children);
        } else {
          delete node.children; // 可选：若不需要空 children，可删除
        }
        return node;
      });
    };

    return cleanChildren(tree);
  }
}
