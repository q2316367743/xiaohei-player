<template>
  <t-layout class="abs-0 overflow-hidden app-container">
    <t-aside class="app-aside" :width="asideWidth">
      <t-menu v-model="value" :collapsed>
        <template #logo>
          <div class="flex justify-left items-center" :style="{marginLeft: collapsed ? undefined : '16px'}">
            <t-avatar image="/logo.png"/>
            <div v-if="!collapsed" class="ml-8px">小黑影音</div>
          </div>
        </template>
        <template #operations>
          <t-button theme="primary" shape="square" variant="text" @click="toggleCollapsed()">
            <template #icon>
              <view-list-icon/>
            </template>
          </t-button>
        </template>
        <t-menu-item to="/" value="/">
          <template #icon>
            <home-icon/>
          </template>
          首页
        </t-menu-item>
        <t-menu-item to="/folder/list" value="/folder/list">
          <template #icon>
            <folder-open-icon/>
          </template>
          文件浏览
        </t-menu-item>
        <t-menu-item to="/library/list" value="/library/list">
          <template #icon>
            <internet-icon/>
          </template>
          媒体库
        </t-menu-item>
        <t-submenu title="流媒体" value="/network">
          <template #icon>
            <video-icon/>
          </template>
          <t-menu-item to="/stream/list" value="/stream/list" replace>
            <template #icon>
              <app-icon/>
            </template>
            发现
          </t-menu-item>
          <t-menu-item to="/stream/search" value="/stream/search" replace>
            <template #icon>
              <search-icon/>
            </template>
            搜索
          </t-menu-item>
        </t-submenu>
        <t-submenu title="设置" value="/setting">
          <template #icon>
            <setting-icon/>
          </template>
          <t-menu-item value="/setting/task" :to="{ name: 'SettingTask' }" replace>
            <template #icon>
              <task-icon/>
            </template>
            任务设置
          </t-menu-item>
          <t-menu-item value="/setting/library" :to="{ name: 'SettingLibrary' }" replace>
            <template #icon>
              <folder-icon/>
            </template>
            库设置
          </t-menu-item>
          <t-menu-item value="/setting/network" :to="{ name: 'SettingNetwork' }" replace>
            <template #icon>
              <wifi-icon/>
            </template>
            流媒体
          </t-menu-item>
          <t-menu-item value="/setting/interface" :to="{ name: 'SettingInterface' }" replace>
            <template #icon>
              <palette-icon/>
            </template>
            界面设置
          </t-menu-item>
          <t-menu-item value="/setting/system" :to="{ name: 'SettingSystem' }" replace>
            <template #icon>
              <desktop-icon/>
            </template>
            系统设置
          </t-menu-item>
          <t-menu-item value="/setting/log" :to="{ name: 'SettingLog' }" replace>
            <template #icon>
              <file-icon/>
            </template>
            日志
          </t-menu-item>
          <t-menu-item value="/setting/about" :to="{ name: 'SettingAbout' }" replace>
            <template #icon>
              <info-circle-icon/>
            </template>
            关于
          </t-menu-item>
        </t-submenu>
      </t-menu>
    </t-aside>
    <t-content class="h-100vh overflow-hidden app-content">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="['FolderDetail', 'LibraryDetail', 'StreamList']">
          <component :is="Component" :key="route.fullPath"/>
        </keep-alive>
      </router-view>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import {
  AppIcon,
  DesktopIcon, FileIcon,
  FolderIcon,
  FolderOpenIcon,
  HomeIcon, InfoCircleIcon, InternetIcon, PaletteIcon, SearchIcon,
  SettingIcon, TaskIcon,
  VideoIcon,
  ViewListIcon, WifiIcon
} from "tdesign-icons-vue-next";
import {collapsed, toggleCollapsed} from "@/global/Constants.ts";
import {useSettingStore, useLibraryStore, useStreamStore} from "@/store";

const route = useRoute();

const value = ref("/");

const asideWidth = computed(() => {
  if (route.path.startsWith("/player")) return '0px';
  return collapsed.value ? '64px' : '232px';
})

watch(() => route.path, val => {
  if (val === '/setting') {
    value.value = val;
  }
})

onMounted(() => {
  useSettingStore().init();
  useLibraryStore().init();
  useStreamStore().init();
})
</script>
<style scoped lang="less">
.app-container {
  .app-aside {
    border-right: 1px solid var(--td-border-level-1-color);
    box-shadow: var(--td-shadow-1);
    overflow-x: hidden;
    overflow-y: auto;
    flex-shrink: 0;
  }

}
</style>
