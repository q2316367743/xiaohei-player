import type {NetworkServer, NetworkServerEdit} from "@/entity";
import {useSql} from "@/lib/sql.ts";
import type {INetworkServer} from "@/module/network/INetworkServer.ts";
import {createNetworkServer} from "@/module/network/factory.ts";

const streamServiceMap = new Map<string, INetworkServer>();

export const listStreamServer = () => {
  return useSql().query<NetworkServer>('network_server')
    .orderByAsc('sequence')
    .list();
}

export const addStreamServer = (data: NetworkServerEdit) => {
  const now = Date.now();
  return useSql().mapper<NetworkServer>('network_server')
    .insert({
      ...data,
      created_at: now,
      updated_at: now
    })
}

export const updateStreamServer = async (id: string, data: Partial<NetworkServerEdit>) => {
  const now = Date.now();
  await useSql().mapper<NetworkServer>('network_server')
    .updateById(id, {
      ...data,
      updated_at: now
    })
  streamServiceMap.delete(id);
}

export const deleteStreamServer = async (id: string) => {
  await useSql().mapper<NetworkServer>('network_server').deleteById(id)
  streamServiceMap.delete(id);
}

function getSsClient(item: NetworkServer): INetworkServer {
  const cache = streamServiceMap.get(item.id);
  if (cache) return cache;
  const client = createNetworkServer(item);
  streamServiceMap.set(item.id, client);
  return client;
}

export const getStreamServerClient = async (id: string) => {
  const cache = streamServiceMap.get(id);
  if (cache) return cache;
  const item = await useSql().query<NetworkServer>('network_server').eq('id', id).get();
  if (!item) return undefined;
  return getSsClient(item);
}

export const getStreamServerForSearch = async () => {
  // 搜索全部可搜索的
  const list = await useSql().query<NetworkServer>('network_server')
    .eq('is_aggregate_search', 1)
    .orderByAsc('sequence')
    .list();
  return list.map(getSsClient);
}