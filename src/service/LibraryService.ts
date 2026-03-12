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
  if (!oldItem) return Promise.reject("收藏库不存在");

  // 设置了旧密码
  const check = await checkMd5Password(old, oldItem.password);
  if (!check) return Promise.reject("密码错误");

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
  // 所有的视频变为已删除
  await useSql().select(`update video set is_deleted = '1' where library_id = ${id}`);
  // 删除全部的标记
  await useSql().select(`delete from marker where library_id = ${id}`);
  // 删除全部的演员
  await useSql().select(`delete from actor where library_id = ${id}`);
  // 删除全部的标签
  await useSql().select(`delete from tag where library_id = ${id}`);

}