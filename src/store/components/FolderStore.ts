import {defineStore} from "pinia";
import type {FolderLocal, FolderLocalCore} from "@/entity/domain/FolderLocal.ts";
import type {FolderWebDav} from "@/entity/domain/FolderWebDav.ts";
import {
  addFolderLocal,
  listFolderLocal,
  listFolderWebdav,
  removeFolderLocal,
  updateFolderLocalPassword
} from "@/service";

export const useFolderStore = defineStore('folder', () => {
  const folderLocal = ref(new Array<FolderLocal>());
  const folderWebdav = ref(new Array<FolderWebDav>());

  const init = async () => {
    folderLocal.value = await listFolderLocal();
    folderWebdav.value = await listFolderWebdav();
  }

  const addLocal = async (form: FolderLocalCore) => {
    await addFolderLocal(form);
    folderLocal.value = await listFolderLocal();
  }

  const updateLocalPassword = async (id: string, old: string, password: string) => {
    await updateFolderLocalPassword(id, old, password);
    folderLocal.value = await listFolderLocal();
  }

  const removeLocal = async (id: string) => {
    await removeFolderLocal(id);
    folderLocal.value = await listFolderLocal();
  }

  return {
    folderLocal,
    folderWebdav,
    init,
    addLocal,
    updateLocalPassword,
    removeLocal
  }
})