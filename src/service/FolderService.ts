import type {Folder, FolderType, FolderView, FolderViewCore} from "@/entity/main/Folder.ts";
import {useSql} from "@/lib/sql.ts";
import {checkMd5Password, md5} from "@/util/lang/CryptoUtil.ts";

export async function listFolder(type?: FolderType): Promise<Array<FolderView>> {
  const list = await useSql().query<Folder>('folder')
    .eq('type', type)
    .list();
  return list.map(item => {
    return {
      ...item,
      payload: JSON.parse(item.payload)
    }
  });
}

export async function getFolder(id: string): Promise<FolderView | undefined> {
  const item = await useSql().query<Folder>('folder')
    .eq('id', id)
    .get();
  if (item) {
    return {
      ...item,
      payload: JSON.parse(item.payload)
    }
  }
  return undefined;
}

export async function addFolder(form: FolderViewCore) {
  const now = Date.now();
  await useSql().mapper<Folder>('folder').insert({
    ...form,
    payload: JSON.stringify(form.payload),
    password: form.password ? (await md5(form.password)) : '',
    created_at: now,
    updated_at: now
  });
}

export async function updateFolderPassword(id: string, old: string, password: string) {
  const oldItem = await getFolder(id);
  if (!oldItem) return Promise.reject(new Error("文件夹不存在"));

  // 设置了旧密码
  const check = await checkMd5Password(old, oldItem.password);
  if (!check) return Promise.reject(new Error("密码错误"));

  const now = Date.now();
  await useSql().mapper<Folder>('folder').updateById(id, {
    password: password ? (await md5(password)) : '',
    updated_at: now
  });
}

export function removeFolder(id: string) {
  return useSql().mapper<Folder>('folder').deleteById(id);
}