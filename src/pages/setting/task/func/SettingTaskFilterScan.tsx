import {DialogPlugin, Transfer} from "tdesign-vue-next";
import {useLibraryStore} from "@/store";

export function openFilterScan(): Promise<Array<string>> {
  return new Promise(async resolve => {
    const libraries = useLibraryStore().libraries;
    const libraryIds = ref(new Array<string>());

    const options = libraries.map(e => ({
      label: e.name,
      value: e.id
    }))

    const dp = DialogPlugin({
      header: "选择扫描的收藏库",
      confirmBtn: "确定",
      placement: "center",
      width: "520px",
      onConfirm: () => {
        resolve(libraryIds.value);
        dp.destroy();
      },
      default: () => <div class={'mx-auto w-444px'}>
        <Transfer v-model={libraryIds.value} data={options}/>
      </div>
    })
  })
}