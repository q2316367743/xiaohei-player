<template>
  <div class="app-layout">
    <div class="app-layout-header">
      <slot v-if="slot.title" name="title"/>
      <div v-else>{{ title }}</div>
      <div class="ml-auto mr-32px">
        <slot name="action"/>
      </div>
    </div>
    <div class="app-layout-content">
      <slot/>
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
  }
})
const slot = defineSlots<{
  default: () => JSX.Element,
  title: () => JSX.Element,
  action: () => JSX.Element
}>()
</script>
<style scoped lang="less">
.app-layout {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  user-select: none;
  background-color: var(--td-bg-color-container);

  .app-layout-header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 56px;
    border-bottom: 1px solid var(--td-border-level-1-color);
    display: flex;
    align-items: center;
    padding-left: 16px;
    gap: 8px;
  }

  .app-layout-content {
    position: absolute;
    top: 57px;
    left: 0;
    right: 0;
    bottom: 0;
    transform: scale(1);
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
