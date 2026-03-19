<template>
  <div class="w-full h-full setting">
    <t-tabs v-model="path" class="mt-6px">
      <t-tab-panel label="任务" value="/setting/task"></t-tab-panel>
      <t-tab-panel label="收藏库" value="/setting/library"></t-tab-panel>
      <t-tab-panel label="界面" value="/setting/interface"></t-tab-panel>
      <t-tab-panel label="系统" value="/setting/system"></t-tab-panel>
      <t-tab-panel v-if="showLog" label="日志" value="/setting/log"></t-tab-panel>
      <t-tab-panel label="关于" value="/setting/about"></t-tab-panel>
    </t-tabs>
    <div class="setting-content" :style="contentStyle">
      <TaskPage v-if="path === '/setting/task'"/>
      <LibraryPage v-else-if="path === '/setting/library'"/>
      <InterfacePage v-else-if="path === '/setting/interface'"/>
      <SystemPage v-else-if="path === '/setting/system'"/>
      <LogPage v-else-if="path === '/setting/log'"/>
      <AboutPage v-else-if="path === '/setting/about'"/>
    </div>
    <t-back-top container=".setting-content"/>
  </div>
</template>
<script lang="ts" setup>
import TaskPage from "./task/SettingTask.vue";
import LibraryPage from "./library/SettingLibrary.vue";
import InterfacePage from "./interface/index.vue";
import SystemPage from "./system/SettingSystem.vue";
import LogPage from "./log/index.vue";
import AboutPage from "./about/index.vue";
import {isTauri} from "@tauri-apps/api/core";

const route = useRoute();

const path = ref('/setting/task');
const showLog = ref(isTauri());

const contentStyle = computed(() => {
  if (path.value === '/setting/about') {
    return {
      overflow: 'hidden',
      padding: 0,
      height: 'calc(100vh - 48px)'
    }
  }
  return {};
});

onMounted(() => {
  if (route.query.active) {
    path.value = `/setting/${route.query.active}`
  }
})
</script>
<style scoped lang="less">
.setting {
  height: 100vh;

  .setting-content {
    height: calc(100vh - 64px);
    overflow-y: auto;
    padding: 8px;
  }

  :deep(.setting-card) {
    & > .t-card__body {
      padding-top: 0 !important;
    }
  }
}
</style>
