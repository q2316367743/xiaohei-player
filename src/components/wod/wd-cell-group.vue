<template>
  <div 
    class="wd-cell-group" 
    :class="{ 
      'wd-cell-group--insert': insert,
      'wd-cell-group--border': border
    }"
  >
    <div v-if="title || value || useSlot" class="wd-cell-group__header">
      <div v-if="title" class="wd-cell-group__title">{{ title }}</div>
      <div v-if="value" class="wd-cell-group__value">{{ value }}</div>
      <slot v-if="useSlot" name="header"></slot>
    </div>
    <div class="wd-cell-group__body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { provide } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  value: {
    type: String,
    default: ''
  },
  border: {
    type: Boolean,
    default: false
  },
  insert: {
    type: Boolean,
    default: false
  },
  useSlot: {
    type: Boolean,
    default: false
  }
})

provide('groupBorder', props.border)
</script>

<style scoped lang="less">
.wd-cell-group {
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  box-shadow: var(--td-shadow-1);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--td-shadow-2);
  }

  &--insert {
    border-radius: var(--td-radius-large);
    box-shadow: var(--td-shadow-2);
    background: linear-gradient(145deg, var(--td-bg-color-container), var(--td-bg-color-secondarycontainer));
    border: 1px solid var(--td-border-level-1-color);

    &:hover {
      box-shadow: var(--td-shadow-3);
      transform: translateY(-2px);
    }
  }

  &--border {
    border: 1px solid var(--td-border-level-1-color);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid var(--td-border-level-1-color);
    background-color: var(--td-bg-color-secondarycontainer);
  }

  &__title {
    font: var(--td-font-title-medium);
    color: var(--td-text-color-primary);
    font-weight: 600;
  }

  &__value {
    font: var(--td-font-body-medium);
    color: var(--td-text-color-secondary);
  }

  &__body {
    background-color: var(--td-bg-color-container);
  }
}
</style>
