<template>
  <div
    class="movie-poster"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <div class="poster-cover">
      <t-image
        :src="coverUrl"
        fit="cover"
        class="poster-image"
      />
      <video
        v-show="isHovered && previewUrl"
        :src="previewUrl"
        class="poster-preview-video"
        autoplay
        loop
        muted
        playsinline
      />
      <div class="duration-tag" v-if="video.duration_ms">
        {{ formatDuration(video.duration_ms) }}
      </div>
    </div>
    <div class="poster-info">
      <div class="poster-title" :title="video.title">{{ video.title }}</div>
      <div class="poster-meta">
        <span class="meta-tag">{{ formatSize(video.file_size) }}</span>
        <span class="meta-tag" v-if="video.play_count > 0">
          <t-icon name="play-circle" size="12px" />
          {{ video.play_count }}
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
</script>

<style scoped lang="less">
.movie-poster {
  margin-bottom: 0;
  border-radius: var(--td-radius-large);
  overflow: hidden;
  background: var(--td-bg-color-container);
  box-shadow: var(--td-shadow-1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: var(--td-shadow-3);
  }
}

.poster-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  background: var(--td-bg-color-page);
  overflow: hidden;
}

.poster-image {
  width: 100%;
  height: 100%;
  display: block;
}

.poster-preview-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.duration-tag {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.75);
  color: var(--td-font-white-1);
  font-size: 12px;
  border-radius: var(--td-radius-default);
  z-index: 2;
  backdrop-filter: blur(4px);
}

.poster-info {
  padding: 10px 12px;
}

.poster-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  min-height: 36px;
  margin-bottom: 6px;
}

.poster-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: var(--td-text-color-secondary);
  padding: 2px 6px;
  background: var(--td-bg-color-secondarycontainer);
  border-radius: var(--td-radius-default);
}
</style>
