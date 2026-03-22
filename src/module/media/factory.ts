import type {MediaServer} from "@/entity";
import type {IMediaServer} from "@/module/media/IMediaServer.ts";
import {JellyfinClient} from "@/module/media/services/jellyfin/JellyfinClient.ts";
import {EmbyClient} from "@/module/media/services/emby/EmbyClient.ts";
import {PlexClient} from "@/module/media/services/plex/PlexClient.ts";

export function createMediaClient(server: MediaServer): IMediaServer {
  if (server.type === 'jellyfin') {
    return new JellyfinClient(server);
  } else if (server.type === 'emby') {
    return new EmbyClient(server);
  } else if (server.type === 'plex') {
    return new PlexClient(server);
  }
  throw Error(`Unsupported media server type: ${server.type}`);
}