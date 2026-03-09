<template>
  <app-tool-layout title="视频下载" :show-sidebar="sidebarVisible" :sidebar-width="360">
    <template #action>
      <t-button variant="text" @click="toggleSidebar">
        <template #icon>
          <t-icon name="download-1"/>
        </template>
        下载列表
      </t-button>
    </template>
    <t-tabs v-model="activeKey">
      <t-tab-panel label="短视频" value="short"></t-tab-panel>
      <t-tab-panel label="央视频" value="央视频"></t-tab-panel>
    </t-tabs>
    <div style="height: calc(100vh - 116px);overflow: auto">
      <DownloadShortVideo v-if="activeKey === 'short'"/>
    </div>
    <template #sidebar>
      <DownloadList/>
    </template>
  </app-tool-layout>
</template>
<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {useDownloadStore} from "@/store";
import DownloadList from "@/pages/download/components/DownloadList.vue";
import DownloadShortVideo from "@/pages/download/components/DownloadShortVideo.vue";

const downloadStore = useDownloadStore();
const {sidebarVisible} = storeToRefs(downloadStore);
const activeKey = ref('short');

const toggleSidebar = () => {
  downloadStore.toggleSidebar();
}

</script>
<style scoped lang="less">
</style>
