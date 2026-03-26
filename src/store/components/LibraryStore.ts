import {defineStore} from "pinia";
import type {LibraryEntity} from "@/entity";
import {listLibrary} from "@/service";

export const useLibraryStore = defineStore('libraryStore', () => {
  const libraries = ref(new Array<LibraryEntity>());

  // 加密的收藏库
  const encryptedLibraryIds = computed(() => libraries.value.filter(library => Boolean(library.password)).map(e => e.id));

  const init = async () => {
    libraries.value = await listLibrary();
  }


  return {
    libraries, encryptedLibraryIds,
    init,
  }
})