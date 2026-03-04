import {
  buildDownloadPluginCore, buildDownloadPluginCorePartial,
  buildDownloadPluginView,
  type DownloadPlugin,
  type DownloadPluginViewCore
} from "@/entity/main/DownloadPlugin.ts";
import {useSql} from "@/lib/sql.ts";

export async function listDownloadPlugin(){
  const list = await useSql().query<DownloadPlugin>('download_plugin').list();
  return list.map(buildDownloadPluginView);
}

export async function addDownloadPlugin(form: DownloadPluginViewCore) {
  const now = Date.now();
  await useSql().mapper<DownloadPlugin>('download_plugin').insert({
    ...buildDownloadPluginCore(form),
    created_at: now,
    updated_at: now
  });
}

export async function updateDownloadPlugin(id: string, form: Partial<DownloadPluginViewCore>) {
  const now = Date.now();
  await useSql().mapper<DownloadPlugin>('download_plugin').updateById(id, {
    ...buildDownloadPluginCorePartial(form),
    updated_at: now
  });
}

export async function removeDownloadPlugin(id: string) {
  await useSql().mapper<DownloadPlugin>('download_plugin').deleteById(id);
}