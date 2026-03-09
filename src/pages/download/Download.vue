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
    <div style="height: calc(100vh - 56px);overflow: auto">
      <DownloadShortVideo />
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

const toggleSidebar = () => {
  downloadStore.toggleSidebar();
}

</script>
<style scoped lang="less">
</style>
