<template>
  <div class="page-layout">
    <header class="page-header">
      <t-space size="small" class="page-header__left">
        <t-button theme="primary" variant="text" shape="square" @click="handlerClick">
          <template #icon>
            <chevron-left-icon />
          </template>
        </t-button>
        <div class="page-header__title">
          <slot name="title" v-if="slots['title']"></slot>
          <span v-else-if="title">{{ title }}</span>
        </div>
      </t-space>
      <div class="page-header__right" v-if="slots['extra']">
        <slot name="extra"></slot>
      </div>
    </header>
    <div class="page-container">
      <slot/>
    </div>
    <t-back-top container=".page-layout .page-container" />
  </div>
</template>
<script lang="ts" setup>
import {ChevronLeftIcon} from "tdesign-icons-vue-next";

const router = useRouter();

defineProps({
  title: String
});
const slots = defineSlots();

function handlerClick() {
  router.back()
}
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
    padding: 12px 12px 11px 8px;
    height: 56px;
    line-height: 32px;
    border-bottom: 1px solid var(--td-border-level-2-color);
    box-sizing: border-box;

    &__left {
      display: flex;
      align-items: center;
    }

    &__title {
      display: flex;
      align-items: center;
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
