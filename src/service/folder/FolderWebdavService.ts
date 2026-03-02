import {useSql} from "@/lib/sql.ts";
import type {FolderWebDav} from "@/entity/domain/FolderWebDav.ts";

export function listFolderWebdav() {
  return useSql().query<FolderWebDav>('folder_webdav').list();
}