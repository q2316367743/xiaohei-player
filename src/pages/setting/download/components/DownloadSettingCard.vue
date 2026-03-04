<template>
  <t-card>
    <t-list size="small" split>
      <t-list-item>
        <t-list-item-meta title="抖音下载目录">
          <template #description>
            <t-link theme="primary">{{ data.douyin || '未设置' }}</t-link>
          </template>
        </t-list-item-meta>
        <template #action>
          <t-button theme="primary" @click="onPathEdit('douyin')">编辑</t-button>
        </template>
      </t-list-item>
      <t-list-item>
        <t-list-item-meta title="哔哩哔哩下载目录">
          <template #description>
            <t-link theme="primary">{{ data.bilibili || '未设置' }}</t-link>
          </template>
        </t-list-item-meta>
        <template #action>
          <t-button theme="primary" @click="onPathEdit('bilibili')">编辑</t-button>
        </template>
      </t-list-item>
    </t-list>
  </t-card>
</template>
<script lang="ts" setup>
import MessageUtil from "@/util/model/MessageUtil.ts";
import {logDebug} from "@/lib/log.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {type DownloadSetting, DownloadSettingTitle, getDownloadSetting} from "@/entity/setting/DownloadSetting.ts";
import {useDownloadSettingStore} from "@/store";

const data = ref<DownloadSetting>(getDownloadSetting());

onMounted(() => {
  data.value = useDownloadSettingStore().downloadSetting;
});

function onChange<K extends keyof DownloadSetting>(key: K, value: any) {
  useDownloadSettingStore()
    .setPath(key, value)
    .then(() => logDebug("保存成功"))
    .catch(e => MessageUtil.error("保存失败", e));
}

const onPathEdit = (key: keyof DownloadSetting) => {
  MessageBoxUtil.folder("", DownloadSettingTitle[key], {
    inputValue: data.value[key] as string
  }).then((res) => {
    onChange(key, res);
    data.value[key] = res as never;
  })
}

</script>
<style scoped lang="less">

</style>
