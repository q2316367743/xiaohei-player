<template>
  <t-layout class="abs-0 overflow-hidden app-container">
    <t-aside class="app-aside" :width="collapsed ? '64px' : '232px'">
      <t-menu :collapsed default-value="/">
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
        <t-menu-item to="/history" value="/history">
          <template #icon>
            <history-icon/>
          </template>
          最近播放
        </t-menu-item>
        <t-submenu title="文件" value="/file">
          <template #icon>
            <file-icon/>
          </template>
          <t-menu-item to="/file/webdav" value="/file/webdav">
            <template #icon>
              <internet-icon/>
            </template>
            WebDAV
          </t-menu-item>
          <t-menu-item to="/file/local" value="/file/local">
            <template #icon>
              <file-attachment-icon/>
            </template>
            本地文件
          </t-menu-item>
        </t-submenu>
        <t-menu-item to="/library" value="/library">
          <template #icon>
            <video-icon/>
          </template>
          片库
        </t-menu-item>
      </t-menu>
    </t-aside>
    <t-content class="h-100vh overflow-hidden app-content">
      <router-view/>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import {
  FileAttachmentIcon,
  FileIcon,
  HistoryIcon,
  HomeIcon,
  InternetIcon,
  VideoIcon,
  ViewListIcon
} from "tdesign-icons-vue-next";
import {collapsed, toggleCollapsed} from "@/global/Constants.ts";

</script>
<style scoped lang="less">
.app-container {
  .app-aside {
    border-right: 1px solid var(--td-border-level-1-color);
    box-shadow: var(--td-shadow-1);
  }

  .app-content {
    transform: scale(1);
  }
}
</style>
