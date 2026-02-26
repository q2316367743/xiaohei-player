<template>
  <div
    class="video-card"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="video-cover">
      <img
        v-if="coverUrl"
        :src="coverUrl"
        :alt="video.title"
        class="cover-image"
      />
      <div class="video-preview" v-show="isHovered">
        <video
          v-if="previewUrl"
          :src="previewUrl"
          class="preview-video"
          autoplay
          loop
          muted
          playsinline
        />
      </div>
    </div>
    <div class="video-info">
      <div class="video-title" :title="video.title">{{ video.title }}</div>
      <div class="video-meta">
        <span class="duration">{{ formatDuration(video.duration_ms) }}</span>
        <span class="size">{{ formatSize(video.file_size) }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {Video} from '@/entity/domain/Video.ts';
import {convertFileSrc} from '@tauri-apps/api/core';

interface Props {
  video: Video;
  isHovered: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  mouseenter: [];
  mouseleave: [];
}>();

const coverUrl = computed(() => {
  if (props.video.sprite_path) {
    return convertFileSrc(props.video.sprite_path);
  }
  return '';
});

const previewUrl = computed(() => {
  if (props.video.screenshot_path) {
    return convertFileSrc(props.video.screenshot_path);
  }
  return '';
});

function handleMouseEnter() {
  emit('mouseenter');
}

function handleMouseLeave() {
  emit('mouseleave');
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
}
</script>

<style scoped lang="less">
.video-card {
  border-radius: 8px;
  overflow: hidden;
  background: var(--td-bg-color-container);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
}

.video-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--td-bg-color-page);
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-info {
  padding: 12px;
}

.video-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8px;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--td-text-color-secondary);
}

.duration,
.size {
  padding: 2px 6px;
  background: var(--td-bg-color-container-hover);
  border-radius: 4px;
}
</style>
