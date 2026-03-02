import type {FolderLocal, FolderLocalCore} from "@/entity/domain/FolderLocal";
import {useSql} from "@/lib/sql.ts";
import {md5} from "@/util/lang/CryptoUtil.ts";

export function listFolderLocal() {
  return useSql().query<FolderLocal>('folder_local').list();
}

export async function addFolderLocal(form: FolderLocalCore) {
  const now = Date.now();
  await useSql().mapper<FolderLocal>('folder_local').insert({
    ...form,
    password: form.password ? (await md5(form.password)) : '',
    created_at: now,
    updated_at: now
  });
}

export async function updateFolderLocalPassword(id: string, old: string, password: string) {
  const oldItem = await useSql().query<FolderLocal>('folder_local').get();
  if (!oldItem) return Promise.reject(new Error("文件夹不存在"));

  // 设置了旧密码
  if (oldItem.password) {
    const oldSign = await md5(old);
    if (oldSign !== oldItem.password) return Promise.reject(new Error("密码错误"));
  }

  const now = Date.now();
  await useSql().mapper<FolderLocal>('folder_local').updateById(id, {
    password: password ? (await md5(password)) : '',
    updated_at: now
  });
}

export function removeFolderLocal(id: string) {
  return useSql().mapper<FolderLocal>('folder_local').deleteById(id);
}