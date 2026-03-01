import {interfaceSettingStore} from "@/lib/store.ts";
import {defineStore} from "pinia";
import {getInterfaceSetting, type InterfaceSetting} from "@/entity/setting/InterfaceSetting.ts";

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

})