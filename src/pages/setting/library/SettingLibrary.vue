<template>
  <t-card size="small">
    <sub-title title="收藏库">
      <template #action>
        <t-button class="mt-8px" @click="addLibraryItemAdd()">新增目录</t-button>
      </template>
    </sub-title>
    <t-card>
      <t-table :columns="columns" :data="data.items" row-key="path">
      </t-table>
    </t-card>
    <sub-title title="媒体的文件拓展名"/>
    <t-card>
      <t-list size="small" split>
        <t-list-item>
          <t-list-item-meta title="扫描视频拓展名">
            <template #description>
              <div>{{ data.scanExtname.join(',') }}</div>
              <div>扫描视频文件扩展名列表，扫描时匹配的文件将被标识为视频。</div>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onVideoExtnameEdit()">编辑</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="打开视频拓展名">
            <template #description>
              <div>{{ data.openExtname.join(',') }}</div>
              <div>打开视频拓展名列表，控制打开文件时可选择的文件类型。</div>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onImageExtnameEdit()">编辑</t-button>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
    <sub-title title="不包括"/>
    <t-card>
      目前没有任务在运行
    </t-card>
  </t-card>
</template>
<script lang="tsx" setup>
import SubTitle from "@/components/PageTitle/SubTitle.vue";
import {getLibrarySetting, type LibrarySetting} from "@/entity/setting/LibrarySetting.ts";
import {useLibrarySettingStore} from "@/lib/store.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {logDebug} from "@/lib/log.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {addLibraryItem, settingLibraryItemColumns} from "@/pages/setting/library/func.tsx";

const data = ref<LibrarySetting>(getLibrarySetting());

const columns = settingLibraryItemColumns(onItemChange, onDeleteItem);

function onDeleteItem(path: string) {
  const idx = data.value.items.findIndex(i => i.path === path);
  if (idx >= 0) {
    data.value.items.splice(idx, 1);
    onChange('items', data.value.items);
  }
}

onMounted(() => {
  useLibrarySettingStore().get()
    .then((res) => {
      console.log(res);
      data.value = res;
    })
    .catch(e => MessageUtil.error("获取数据失败", e))
})

function onChange<K extends keyof LibrarySetting>(key: K, value: any) {
  useLibrarySettingStore()
    .setItem(key, value)
    .then(() => logDebug("保存成功"))
    .catch(e => MessageUtil.error("保存失败", e));
}

function onItemChange(path: string, key: 'hidden', value: boolean) {
  for (let item of data.value.items) {
    if (item.path === path) {
      item[key] = value;
      break;
    }
  }
  onChange('items', data.value.items);
}

const onVideoExtnameEdit = () => {
  console.log(data.value)
  MessageBoxUtil.tagPrompt("扫描视频文件扩展名列表，扫描时匹配的文件将被标识为视频。", "扫描视频拓展名", {
    initValue: data.value.scanExtname
  }).then((res) => {
    onChange('scanExtname', res);
    data.value.scanExtname = res;
  })
}
const onImageExtnameEdit = () => {
  MessageBoxUtil.tagPrompt("打开视频拓展名列表，控制打开文件时可选择的文件类型。", "打开视频拓展名", {
    initValue: data.value.openExtname
  }).then((res) => {
    onChange('openExtname', res);
    data.value.openExtname = res;
  })
}

const addLibraryItemAdd = () => {
  addLibraryItem(item => {
    const idx = data.value.items.findIndex(i => i.path === item.path);
    if (idx >= 0) {
      MessageUtil.warning("已存在");
      return;
    }
    data.value.items.push(item);
    onChange('items', data.value.items);
  })
}
</script>
<style scoped lang="less">

</style>
