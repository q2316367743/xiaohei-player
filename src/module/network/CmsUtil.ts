import type {CmsHomeClass} from "@/module/network/types/NetworkCommon.ts";
import type {NetworkCategory} from "@/module/network/types/NetworkCategory.ts";
import {group, MapWrapper} from "@/util";

function classToCategory(c: CmsHomeClass): NetworkCategory {
  return {
    id: c.type_id + '',
    name: c.type_name,
    cover: '',
    children: []
  }
}

const _tree = (node: NetworkCategory, map: MapWrapper<number | undefined, Array<CmsHomeClass>>, cGroupMap: MapWrapper<number | undefined, Array<CmsHomeClass>>) => {
  const nodes = cGroupMap.getOrDefault(Number(node.id), []);
  node.children = nodes.map(e => classToCategory(e))
  node.children.forEach(n => _tree(n, map, cGroupMap));
}

export function cmsTreeTransfer(c: Array<CmsHomeClass>): Array<NetworkCategory> {
  const cGroupMap = group(c, 'type_pid');
  const t = {
    id: '0',
    name: '',
    cover: '',
    children: []
  };
  _tree(t, cGroupMap, cGroupMap);
  return [...t.children, ...cGroupMap.getOrDefault(undefined, []).map(e => classToCategory(e))];
}