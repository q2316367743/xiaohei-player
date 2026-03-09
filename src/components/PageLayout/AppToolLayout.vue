<template>
  <div class="app-layout">
    <div class="app-layout-header">
      <slot v-if="slot.title" name="title"/>
      <div v-else class="title">{{ title }}</div>
      <div class="ml-auto mr-32px">
        <slot name="action"/>
      </div>
    </div>
    <div class="app-layout-body">
      <t-layout class="h-full w-full">
        <t-content class="h-full overflow-y-auto">
          <slot/>
        </t-content>
        <t-aside v-if="slot.sidebar" class="h-full overflow-y-auto" :width="showSidebar ? `${sidebarWidth}px` : '0'"
                 style="border-left: 1px solid var(--td-border-level-1-color)">
          <slot name="sidebar"/>
        </t-aside>
      </t-layout>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {JSX} from "vue/jsx-runtime";

defineProps({
  title: String,
  home: {
    type: Boolean,
    default: false
  },
  showSidebar: {
    type: Boolean,
    default: false
  },
  sidebarWidth: {
    type: Number,
    default: 232
  }
})
const slot = defineSlots<{
  default: () => JSX.Element,
  title: () => JSX.Element,
  action: () => JSX.Element,
  sidebar: () => JSX.Element
}>()
</script>
<style scoped lang="less">
.app-layout {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  user-select: none;

  .app-layout-header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 55px;
    border-bottom: 1px solid var(--td-border-level-1-color);
    display: flex;
    align-items: center;
    padding-left: 16px;
    gap: 8px;
    background-color: var(--td-bg-color-container);

    font-size: 1.2rem;
    font-weight: bold;
  }

  .app-layout-body {
    position: absolute;
    top: 57px;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    overflow: hidden;
  }

  .app-layout-sidebar {
    width: 360px;
    border-left: 1px solid var(--td-border-level-1-color);
    background-color: var(--td-bg-color-container);
    overflow-y: auto;
    overflow-x: hidden;
    flex-shrink: 0;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
}
</style>
