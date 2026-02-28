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