import type {LibraryEntity, LibraryCore} from "@/entity/main/LibraryEntity.ts";
import {useSql} from "@/lib/sql.ts";
import {checkMd5Password, md5} from "@/util/lang/CryptoUtil.ts";
import {LocalName} from "@/global/LocalName.ts";

export function listLibrary() {
  return useSql().query<LibraryEntity>('library').list();
}

export function getLibrary(id: string) {
  return useSql().query<LibraryEntity>('library').eq('id', id).get();
}

export async function addLibrary(form: LibraryCore) {
  const now = Date.now();
  return useSql().mapper<LibraryEntity>('library').insert({
    ...form,
    cover: '',
    password: form.password ? (await md5(form.password)) : '',
    created_at: now,
    updated_at: now
  });
}


export async function updateLibraryPassword(id: string, old: string, password: string) {
  const oldItem = await getLibrary(id);
  if (!oldItem) return Promise.reject(new Error("收藏库不存在"));

  // 设置了旧密码
  const check = await checkMd5Password(old, oldItem.password);
  if (!check) return Promise.reject(new Error("密码错误"));

  const now = Date.now();
  await useSql().mapper<LibraryEntity>('library').updateById(id, {
    password: password ? (await md5(password)) : '',
    updated_at: now
  });
}

export function updateLibraryCover(id: string, cover: string) {
  return useSql().mapper<LibraryEntity>('library').updateById(id, {
    cover
  });
}

export async function removeLibrary(id: string) {
  await useSql().mapper<LibraryEntity>('library').deleteById(id);
  localStorage.removeItem(LocalName.PAGE_LIBRARY_DETAIL_LAYOUT(id));
  localStorage.removeItem(LocalName.PAGE_LIBRARY_DETAIL_SORT_FIELD(id));
  localStorage.removeItem(LocalName.PAGE_LIBRARY_DETAIL_SORT_ORDER(id));
}