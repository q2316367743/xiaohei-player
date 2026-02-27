<template>
  <div class="scene-page">
    <div class="scene-header">
      <t-radio-group v-model="layout" default-value="grid">
        <t-radio-button value="grid">
          <app-icon />
        </t-radio-button>
        <t-radio-button value="list">
          <view-list-icon />
        </t-radio-button>
      </t-radio-group>
    </div>
    
    <div v-if="layout === 'grid'" class="video-grid">
      <VideoCard
        v-for="video in videos"
        :key="video.id"
        :video="video"
      />
    </div>
    
    <div v-else class="video-list">
      <VideoListItem
        v-for="video in videos"
        :key="video.id"
        :video="video"
      />
    </div>
    
    <t-loading v-if="loading" size="large" />
    <t-empty v-if="!loading && videos.length === 0" description="暂无视频" />
  </div>
</template>

<script lang="ts" setup>
import {listVideo} from '@/service/VideoService.ts';
import type {Video} from '@/entity/domain/Video.ts';
import VideoCard from './VideoCard.vue';
import VideoListItem from './VideoListItem.vue';
import {AppIcon, ViewListIcon} from "tdesign-icons-vue-next";
import {LocalName} from "@/global/LocalName.ts";

const layout = useLocalStorage<'grid' | 'list'>(LocalName.PAGE_LIBRARY_SCENE_LAYOUT, 'grid');

const videos = ref<Video[]>([]);
const loading = ref(true);

onMounted(async () => {
  await loadVideos();
});

async function loadVideos() {
  loading.value = true;
  try {
    videos.value = await listVideo();
  } catch (e) {
    console.error('加载视频列表失败', e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="less">
.scene-page {
}

.scene-header {
  margin-bottom: 16px;
  position: sticky;
  left: 0;
  top: 0;
  right: 0;
  z-index: 99;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
