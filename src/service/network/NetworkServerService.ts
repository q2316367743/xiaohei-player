import type {NetworkServer, NetworkServerEdit} from "@/entity";
import {useSql} from "@/lib/sql.ts";

export const listNetworkServer = () => {
  return useSql().query<NetworkServer>('network_server')
    .list();
}

export const addNetworkServer = (data: NetworkServerEdit) => {
  const now = Date.now();
  return useSql().mapper<NetworkServer>('network_server')
    .insert({
      ...data,
      created_at: now,
      updated_at: now
    })
}

export const updateNetworkServer = (id: string, data: Partial<NetworkServerEdit>) => {
  const now = Date.now();
  return useSql().mapper<NetworkServer>('network_server')
    .updateById(id, {
      ...data,
      updated_at: now
    })
}

export const deleteNetworkServer = (id: string) => {
  return useSql().mapper<NetworkServer>('network_server').deleteById(id)
}