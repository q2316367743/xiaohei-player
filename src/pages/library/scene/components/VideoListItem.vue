<template>
  <div class="video-list-item" @click="handleClick">
    <div
      class="video-cover"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <t-image :src="coverUrl" fit="contain" style="width: 160px;height: 90px;background-color: black"/>
      <div class="video-preview" v-show="isHovered && previewUrl">
        <video
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
        <span class="meta-item">
          <t-icon name="time" size="14px" />
          <span>{{ formatDuration(video.duration_ms) }}</span>
        </span>
        <span class="meta-item">
          <t-icon name="file" size="14px" />
          <span>{{ formatSize(video.file_size) }}</span>
        </span>
        <span class="meta-item" v-if="video.file_birthtime">
          <t-icon name="file-add" size="14px" />
          <span>{{ formatDate(video.file_birthtime) }}</span>
        </span>
        <span class="meta-item" v-if="video.created_at">
          <t-icon name="add-rectangle" size="14px" />
          <span>{{ formatDate(video.created_at) }}</span>
        </span>
        <span class="meta-item" v-if="video.play_count > 0">
          <t-icon name="play-circle" size="14px" />
          <span>{{ video.play_count }}次</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {Video} from '@/entity/domain/Video.ts';
import {convertFileSrcToUrl} from "@/lib/FileSrc.ts";

const router = useRouter();

interface Props {
  video: Video;
}

const props = defineProps<Props>();

function handleClick() {
  router.push(`/player/library/${props.video.id}`);
}

const isHovered = ref(false);

const coverUrl = ref('');
const previewUrl = ref('');

onMounted(() => {
  if (props.video.cover_path) {
    coverUrl.value = convertFileSrcToUrl(props.video.cover_path);
  }
  if (props.video.screenshot_path) {
    previewUrl.value = convertFileSrcToUrl(props.video.screenshot_path);
  }
});



function handleMouseEnter() {
  isHovered.value = true;
}

function handleMouseLeave() {
  isHovered.value = false;
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

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
</script>

<style scoped lang="less">
.video-list-item {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  background: var(--td-bg-color-container);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
}

.video-cover {
  position: relative;
  flex-shrink: 0;
  width: 160px;
  height: 90px;
  background: var(--td-bg-color-page);
  overflow: hidden;
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
  z-index: 1;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 12px;
  min-width: 0;
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
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--td-text-color-secondary);
  padding: 2px 6px;
  background: var(--td-bg-color-container-hover);
  border-radius: 4px;
}
</style>
