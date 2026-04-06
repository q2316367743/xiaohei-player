import {defineStore} from "pinia";
import type {NetworkServer, NetworkServerEdit} from "@/entity";
import type {INetworkServer} from "@/module/network/INetworkServer.ts";
import {
  addStreamServer,
  deleteStreamServer,
  listStreamServer,
  updateStreamServer
} from "@/service";
import {createNetworkServer} from "@/module/network/factory.ts";

export const useStreamStore = defineStore('streamStore', () => {
  const streamServers = ref(new Array<NetworkServer>());

  const streamServiceMap = new Map<string, INetworkServer>();

  const init = async () => {
    streamServers.value = await listStreamServer();
  }

  const add = async (data: NetworkServerEdit) => {
    await addStreamServer(data);
    await init();
  }

  const update = async (id: string, data: NetworkServerEdit) => {
    await updateStreamServer(id, data);
    await init();
    streamServiceMap.delete(id);
  }

  const remove = async (id: string) => {
    await deleteStreamServer(id);
    await init();
    streamServiceMap.delete(id);
  }


  function getSsClient(item: NetworkServer): INetworkServer {
    const cache = streamServiceMap.get(item.id);
    if (cache) return cache;
    const client = createNetworkServer(item);
    streamServiceMap.set(item.id, client);
    return client;
  }

  const getStreamServerClient = async (id: string) => {
    const cache = streamServiceMap.get(id);
    if (cache) return cache;
    const item = streamServers.value.find(e => e.id === id);
    if (!item) return undefined;
    return getSsClient(item);
  }

  const getStreamServerForSearch = async () => {
    return streamServers.value.filter(e => e.is_aggregate_search === 1).map(e => getSsClient(e));
  }

  return {
    streamServers,
    init, add, update, remove,
    getStreamServerClient,
    getStreamServerForSearch
  }

})