import type {NetworkServer, NetworkServerEdit} from "@/entity";
import {useSql} from "@/lib/sql.ts";


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
}

export const deleteStreamServer = async (id: string) => {
  await useSql().mapper<NetworkServer>('network_server').deleteById(id)
}