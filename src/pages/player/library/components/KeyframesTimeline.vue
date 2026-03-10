<template>
  <div class="keyframes-timeline" v-if="vttCues.length > 0">
    <div class="timeline-indicator-fixed">
      <div class="indicator-line"></div>
      <div class="indicator-head"></div>
    </div>
    <div
      class="timeline-container"
      ref="timelineRef"
      @mousedown="onTimelineMouseDown"
      @mousemove="onTimelineMouseMove"
      @mouseup="onTimelineMouseUp"
      @mouseleave="onTimelineMouseLeave"
      @wheel.prevent="onTimelineWheel"
    >
      <div
        class="timeline-track"
        :style="{ transform: `translateX(${-scrollOffset}px)` }"
      >
        <div class="timeline-padding" :style="{ width: `${paddingWidth}px` }"></div>
        <div
          v-for="(cue, index) in vttCues"
          :key="index"
          class="keyframe-item"
          :style="getKeyframeStyle(cue)"
        >
          <span class="keyframe-time">{{ formatTimeShort(cue.startTime) }}</span>
        </div>
        <div class="timeline-padding" :style="{ width: `${paddingWidth}px` }"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { VttCue } from "@/util/file/VttParser.ts";

defineOptions({
  name: 'KeyframesTimeline'
});

const props = defineProps<{
  vttCues: VttCue[];
  currentTime: number;
  duration: number;
  spriteUrl: string;
}>();

const emit = defineEmits<{
  seek: [time: number];
}>();

const timelineRef = ref<HTMLDivElement>();
const scrollOffset = ref(0);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartOffset = ref(0);
const isUserInteracting = ref(false);
const paddingWidth = ref(0);
const cuePositions = ref<{ start: number; end: number; cue: VttCue }[]>([]);

function formatTimeShort(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function updatePaddingWidth() {
  if (!timelineRef.value) return;
  paddingWidth.value = timelineRef.value.clientWidth / 2;
}

function updateCuePositions() {
  if (!timelineRef.value || props.vttCues.length === 0) return;

  const track = timelineRef.value.querySelector('.timeline-track');
  if (!track) return;

  const items = track.querySelectorAll('.keyframe-item');
  const positions: { start: number; end: number; cue: VttCue }[] = [];

  let currentPos = paddingWidth.value;

  items.forEach((item, index) => {
    const width = (item as HTMLElement).offsetWidth;
    const cue = props.vttCues[index];
    if (cue) {
      positions.push({
        start: currentPos,
        end: currentPos + width,
        cue
      });
      currentPos += width;
    }
  });

  cuePositions.value = positions;
}

function getTimeFromOffset(offset: number): number {
  if (!timelineRef.value || props.vttCues.length === 0) return 0;

  const containerWidth = timelineRef.value.clientWidth;
  const centerPosition = offset + containerWidth / 2;

  for (const pos of cuePositions.value) {
    if (centerPosition >= pos.start && centerPosition < pos.end) {
      const ratio = (centerPosition - pos.start) / (pos.end - pos.start);
      const timeRange = pos.cue.endTime - pos.cue.startTime;
      return pos.cue.startTime + ratio * timeRange;
    }
  }

  const lastPos = cuePositions.value[cuePositions.value.length - 1];
  const firstPos = cuePositions.value[0];
  
  if (lastPos && centerPosition >= lastPos.end) {
    return lastPos.cue.endTime;
  }
  if (firstPos && centerPosition <= firstPos.start) {
    return firstPos.cue.startTime;
  }

  return 0;
}

function getOffsetFromTime(time: number): number {
  if (!timelineRef.value || props.vttCues.length === 0) return 0;

  const containerWidth = timelineRef.value.clientWidth;

  for (const pos of cuePositions.value) {
    if (time >= pos.cue.startTime && time < pos.cue.endTime) {
      const ratio = (time - pos.cue.startTime) / (pos.cue.endTime - pos.cue.startTime);
      const position = pos.start + ratio * (pos.end - pos.start);
      return Math.max(0, position - containerWidth / 2);
    }
  }

  const lastPos = cuePositions.value[cuePositions.value.length - 1];
  const firstPos = cuePositions.value[0];
  
  if (lastPos && time >= lastPos.cue.endTime) {
    return lastPos.end - containerWidth / 2;
  }
  if (firstPos && time <= firstPos.cue.startTime) {
    return firstPos.start - containerWidth / 2;
  }

  return 0;
}

function updateScrollOffsetFromTime() {
  if (!timelineRef.value || props.duration === 0) return;

  const newOffset = getOffsetFromTime(props.currentTime);
  if (scrollOffset.value !== newOffset) {
    scrollOffset.value = newOffset;
  }
}

function initScrollPosition() {
  nextTick(() => {
    updatePaddingWidth();
    updateCuePositions();
    updateScrollOffsetFromTime();
  });
}

function onTimelineMouseDown(event: MouseEvent) {
  isDragging.value = true;
  isUserInteracting.value = true;
  dragStartX.value = event.clientX;
  dragStartOffset.value = scrollOffset.value;
}

function onTimelineMouseMove(event: MouseEvent) {
  if (!timelineRef.value || !isDragging.value) return;

  const deltaX = event.clientX - dragStartX.value;
  const newOffset = dragStartOffset.value - deltaX;
  const maxOffset = timelineRef.value.scrollWidth - timelineRef.value.clientWidth;
  const clampedOffset = Math.max(0, Math.min(maxOffset, newOffset));

  scrollOffset.value = clampedOffset;

  const newTime = getTimeFromOffset(clampedOffset);
  emit('seek', newTime);
}

function onTimelineMouseUp() {
  isDragging.value = false;
  setTimeout(() => {
    isUserInteracting.value = false;
  }, 100);
}

function onTimelineMouseLeave() {
  if (isDragging.value) {
    isDragging.value = false;
    setTimeout(() => {
      isUserInteracting.value = false;
    }, 100);
  }
}

function onTimelineWheel(event: WheelEvent) {
  if (!timelineRef.value) return;
  isUserInteracting.value = true;

  const delta = event.deltaY > 0 ? 50 : -50;
  const maxOffset = timelineRef.value.scrollWidth - timelineRef.value.clientWidth;
  const newOffset = Math.max(0, Math.min(maxOffset, scrollOffset.value + delta));

  scrollOffset.value = newOffset;

  const newTime = getTimeFromOffset(newOffset);
  emit('seek', newTime);

  setTimeout(() => {
    isUserInteracting.value = false;
  }, 500);
}

function getKeyframeStyle(cue: VttCue) {
  if (!props.spriteUrl) {
    return {};
  }

  return {
    backgroundImage: `url(${props.spriteUrl})`,
    backgroundPosition: `-${cue.x}px -${cue.y}px`,
    backgroundSize: `${cue.width * 9}px auto`,
    width: `${cue.width}px`,
    height: `${cue.height}px`
  };
}

watch(() => props.currentTime, () => {
  if (!isUserInteracting.value) {
    updateScrollOffsetFromTime();
  }
});

watch(() => props.vttCues, () => {
  initScrollPosition();
}, { immediate: true });

onMounted(() => {
  initScrollPosition();
  
  const resizeObserver = new ResizeObserver(() => {
    updatePaddingWidth();
    updateCuePositions();
    updateScrollOffsetFromTime();
  });
  
  if (timelineRef.value) {
    resizeObserver.observe(timelineRef.value);
  }
  
  onBeforeUnmount(() => {
    resizeObserver.disconnect();
  });
});

defineExpose({
  updateScrollOffsetFromTime,
  initScrollPosition
});
</script>

<style scoped lang="less">
.keyframes-timeline {
  position: relative;
  background: var(--td-bg-color-secondarycontainer);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 
    var(--td-shadow-2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid var(--td-border-level-1-color);
}

.timeline-indicator-fixed {
  position: absolute;
  top: 16px;
  left: 50%;
  bottom: 16px;
  width: 2px;
  transform: translateX(-50%);
  z-index: 20;
  pointer-events: none;
}

.timeline-indicator-fixed .indicator-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--td-error-color);
  transform: translateX(-50%);
  box-shadow: 0 0 8px rgba(255, 59, 48, 0.6);
}

.timeline-indicator-fixed .indicator-head {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  background: linear-gradient(
    145deg,
    var(--td-error-color) 0%,
    #d9363e 100%
  );
  border-radius: 50%;
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.3),
    0 0 12px rgba(255, 59, 48, 0.5);
  border: 3px solid #fff;
}

.timeline-container {
  position: relative;
  height: 64px;
  overflow: hidden;
  border-radius: 8px;
  cursor: grab;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.05) 100%
  );
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.15),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05);
}

.timeline-container:active {
  cursor: grabbing;
}

.timeline-track {
  display: flex;
  height: 100%;
  will-change: transform;
}

.timeline-padding {
  flex-shrink: 0;
  height: 100%;
}

.keyframe-item {
  height: 64px;
  width: auto;
  flex-shrink: 0;
  background-color: var(--td-bg-color-component);
  background-size: cover;
  background-position: center;
  border-right: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;

  &:last-child {
    border-right: none;
  }
}

.keyframe-time {
  position: absolute;
  bottom: 2px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.6);
  padding: 1px 4px;
  border-radius: 3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
