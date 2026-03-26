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
            <video-icon/>
          </template>
          媒体库
        </t-menu-item>
        <t-menu-item to="/setting" value="/setting">
          <template #icon>
            <setting-icon/>
          </template>
          设置
        </t-menu-item>
      </t-menu>
    </t-aside>
    <t-content class="h-100vh overflow-hidden app-content">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="['FolderDetail', 'LibraryDetail']">
          <component :is="Component" :key="route.fullPath"/>
        </keep-alive>
      </router-view>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import {
  FolderOpenIcon,
  HomeIcon,
  SettingIcon,
  VideoIcon,
  ViewListIcon
} from "tdesign-icons-vue-next";
import {collapsed, toggleCollapsed} from "@/global/Constants.ts";
import {useInterfaceSettingStore, useLibraryStore} from "@/store";

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
  useInterfaceSettingStore().init();
  useLibraryStore().init();
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
