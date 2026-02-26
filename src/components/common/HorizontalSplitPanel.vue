<template>
  <div class="horizontal-split-panel" ref="panelRef">
    <div class="top-panel" :style="{ height: topHeight + '%' }">
      <slot name="top"/>
    </div>
    <div
      class="splitter"
      @mousedown="startResize"
      @touchstart="startResize"
      :class="{ 'is-resizing': isResizing }"
    />
    <div class="bottom-panel" :style="{ height: bottomHeight + '%' }">
      <slot name="bottom"/>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  defaultTopHeight?: number;
  minTopHeight?: number;
  minBottomHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
  defaultTopHeight: 50,
  minTopHeight: 20,
  minBottomHeight: 20
});

const panelRef = ref<HTMLElement>();
const isResizing = ref(false);
const topHeight = ref(props.defaultTopHeight);

const bottomHeight = computed(() => 100 - topHeight.value);

const startResize = () => {
  isResizing.value = true;
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
  document.addEventListener('touchmove', onResize);
  document.addEventListener('touchend', stopResize);
};

const onResize = (e: MouseEvent | TouchEvent) => {
  if (!panelRef.value || !isResizing.value) return;

  const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY;
  const rect = panelRef.value.getBoundingClientRect();
  
  if (!rect) return;
  
  const totalHeight = rect.height;
  
  const newTopHeight = ((clientY - rect.top) / totalHeight) * 100;
  
  if (newTopHeight >= props.minTopHeight && newTopHeight <= 100 - props.minBottomHeight) {
    topHeight.value = newTopHeight;
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
.horizontal-split-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.top-panel,
.bottom-panel {
  overflow: auto;
  min-height: 0;
}

.splitter {
  height: 8px;
  background-color: var(--td-border-level-2-color);
  cursor: row-resize;
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
    width: 20px;
    height: 2px;
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
