import {interfaceSettingStore, systemSettingStore} from "@/lib/store.ts";
import {defineStore} from "pinia";
import {getInterfaceSetting, type InterfaceSetting} from "@/entity/setting/InterfaceSetting.ts";
import {getSystemSetting, type SystemSetting} from "@/entity";

export const useSettingStore = defineStore('interfaceSetting', () => {

  const interfaceSetting = ref(getInterfaceSetting());
  const systemSetting = ref(getSystemSetting());

  const showPreviewAxis = computed(() => interfaceSetting.value.showPreviewAxis);
  const videoFromStart = computed(() => interfaceSetting.value.videoFromStart);
  const videoAutoPlay = computed(() => interfaceSetting.value.videoAutoPlay);

  const init = async () => {
    interfaceSetting.value = await interfaceSettingStore.get();
    systemSetting.value = await systemSettingStore.get();
  }

  const setInterfaceItem = async <K extends keyof InterfaceSetting>(key: K, value: InterfaceSetting[K]) => {
    interfaceSetting.value[key] = value;
    await interfaceSettingStore.setItem(key, value);
  }

  const setSystemItem = async <K extends keyof SystemSetting>(key: K, value: SystemSetting[K]) => {
    systemSetting.value[key] = value;
    await systemSettingStore.setItem(key, value);
  }

  return {
    interfaceSetting, showPreviewAxis, videoFromStart, videoAutoPlay,
    systemSetting,
    init,
    setInterfaceItem, setSystemItem
  }

});


