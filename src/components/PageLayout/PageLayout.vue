<template>
  <div class="page-layout">
    <header class="page-header">
      <div class="page-header__left">
        <div class="page-header__title">
          <slot name="title" v-if="slots['title']"></slot>
          <span v-else-if="title">{{ title }}</span>
          <span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
        </div>
      </div>
      <div class="page-header__right" v-if="slots['extra']">
        <slot name="extra"></slot>
      </div>
    </header>
    <div class="page-container">
      <slot/>
    </div>
    <t-back-top container=".page-layout .page-container"/>
  </div>
</template>
<script lang="ts" setup>
defineProps({
  title: String,
  subtitle: String
});
const slots = defineSlots();
</script>
<style scoped lang="less">
.page-layout {
  position: relative;
  width: 100%;
  height: 100%;

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 12px 11px;
    height: 56px;
    line-height: 32px;
    border-bottom: 1px solid var(--td-border-level-2-color);
    box-sizing: border-box;

    &__left {
      display: flex;
      align-items: center;
      padding-left: 8px;
    }

    &__title {
      display: flex;
      align-items: center;

      .subtitle {
        margin-left: 6px;
        font-size: 0.9rem;
        color: var(--td-text-color-secondary);
      }
    }

  }

  .page-container {
    position: absolute;
    top: 56px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
  }
}
</style>
