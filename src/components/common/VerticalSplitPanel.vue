<template>
  <div class="vertical-split-panel" ref="panelRef">
    <div class="left-panel" :style="{ width: leftWidth + '%' }">
      <slot name="left"/>
    </div>
    <div
      class="splitter"
      @mousedown="startResize"
      @touchstart="startResize"
      :class="{ 'is-resizing': isResizing }"
    />
    <div class="right-panel" :style="{ width: rightWidth + '%' }">
      <slot name="right"/>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  defaultLeftWidth: 50,
  minLeftWidth: 20,
  minRightWidth: 20
});

const panelRef = ref<HTMLElement>();
const isResizing = ref(false);
const leftWidth = ref(props.defaultLeftWidth);

const rightWidth = computed(() => 100 - leftWidth.value);

const startResize = () => {
  isResizing.value = true;
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
  document.addEventListener('touchmove', onResize);
  document.addEventListener('touchend', stopResize);
};

const onResize = (e: MouseEvent | TouchEvent) => {
  if (!panelRef.value || !isResizing.value) return;

  const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
  const rect = panelRef.value.getBoundingClientRect();
  const totalWidth = rect.width;
  
  const newLeftWidth = ((clientX - rect.left) / totalWidth) * 100;
  
  if (newLeftWidth >= props.minLeftWidth && newLeftWidth <= 100 - props.minRightWidth) {
    leftWidth.value = newLeftWidth;
  }
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
  document.removeEventListener('touchmove', onResize);
  document.removeEventListener('touchend', stopResize);
};

onUnmounted(() => {
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
  document.removeEventListener('touchmove', onResize);
  document.removeEventListener('touchend', stopResize);
});
</script>

<style scoped lang="less">
.vertical-split-panel {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.left-panel,
.right-panel {
  overflow: auto;
  min-width: 0;
}

.splitter {
  width: 8px;
  background-color: var(--td-border-level-2-color);
  cursor: col-resize;
  flex-shrink: 0;
  transition: background-color 0.2s;
  position: relative;

  &:hover,
  &.is-resizing {
    background-color: var(--td-brand-color);
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 20px;
    background-color: var(--td-text-color-secondary);
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover::after,
  &.is-resizing::after {
    opacity: 1;
  }
}
</style>
