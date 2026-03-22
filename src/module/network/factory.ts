import type {NetworkServer} from "@/entity";
import type {INetworkServer} from "@/module/network/INetworkServer.ts";
import {NetworkServerMc10Xml} from "@/module/network/services/mc10/NetworkServerMc10Xml.ts";
import {NetworkServerMc10Json} from "@/module/network/services/mc10/NetworkServerMc10Json.ts";


export function createNetworkServer(res: NetworkServer): INetworkServer {
  switch (res.type) {
    case 'mc10':
      if (res.format === 'xml') {
        return new NetworkServerMc10Xml(res);
      } else {
        return new NetworkServerMc10Json(res);
      }
    default:
      throw Error(`Unsupported network server type: ${res.type}`);
  }
}