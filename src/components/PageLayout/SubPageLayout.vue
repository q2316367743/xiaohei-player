<template>
  <div class="page-layout">
    <header class="page-header">
      <div class="page-header__left flex gap-8px overflow-hidden mr-8px">
        <t-button variant="outline" shape="square" class="shrink-0" @click="handlerClick">
          <template #icon>
            <chevron-left-icon/>
          </template>
        </t-button>
        <div class="page-header__title ellipsis">
          <slot name="title" v-if="slots['title']"></slot>
          <template v-else-if="title">{{ title }}</template>
        </div>
      </div>
      <div class="page-header__right" v-if="slots['action']">
        <slot name="action"></slot>
      </div>
    </header>
    <div class="page-container">
      <slot/>
    </div>
    <t-back-top container=".page-layout .page-container"/>
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
    background-color: var(--td-bg-color-container);

    &__left {
      display: flex;
      align-items: center;
      padding-left: 4px;
    }

    &__title {
      font-size: 1.2rem;
      font-weight: bold;
      padding-top: 3px;
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
