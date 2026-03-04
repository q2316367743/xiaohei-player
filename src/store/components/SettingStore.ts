import {downloadSettingStore, interfaceSettingStore} from "@/lib/store.ts";
import {defineStore} from "pinia";
import {getInterfaceSetting, type InterfaceSetting} from "@/entity/setting/InterfaceSetting.ts";
import {type DownloadSetting, getDownloadSetting, initDownloadSettingPath} from "@/entity/setting/DownloadSetting.ts";
import {logError} from "@/lib/log.ts";

export const useInterfaceSettingStore = defineStore('interfaceSetting', () => {

  const interfaceSetting = ref(getInterfaceSetting());

  const init = async () => {
    interfaceSetting.value = await interfaceSettingStore.get();
  }

  const setItem = async <K extends keyof InterfaceSetting>(key: K, value: InterfaceSetting[K]) => {
    interfaceSetting.value[key] = value;
    await interfaceSettingStore.setItem(key, value);
  }

  return {
    interfaceSetting,
    init,
    setItem
  }

});

export const useDownloadSettingStore = defineStore('downloadSetting', () => {

  const downloadSetting = ref(getDownloadSetting());

  const init = async () => {
    downloadSetting.value = await downloadSettingStore.get();
  }

  const setPath = async <K extends keyof DownloadSetting>(key: K, value: DownloadSetting[K]) => {
    downloadSetting.value[key] = value;
    await downloadSettingStore.setItem(key, value);
  }

  const getPath = async <K extends keyof DownloadSetting>(key: K) => {
    const path = downloadSetting.value[key];
    if (!path) {
      const path = await initDownloadSettingPath(key);
      // 保存
      setPath(key, path).catch(e => logError('Failed to save download path:', e));
      return path;
    }
    return path;
  }

  return {
    downloadSetting,
    init,
    setPath,
    getPath
  }

});


