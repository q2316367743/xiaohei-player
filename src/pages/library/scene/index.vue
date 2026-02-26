<template>
  <div class="scene-page">
    <div class="video-grid">
      <VideoCard
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
import {ref, onMounted} from 'vue';
import {getAllVideos} from '@/service/VideoService.ts';
import type {Video} from '@/entity/domain/Video.ts';
import VideoCard from './VideoCard.vue';

const videos = ref<Video[]>([]);
const loading = ref(true);

onMounted(async () => {
  await loadVideos();
});

async function loadVideos() {
  loading.value = true;
  try {
    videos.value = await getAllVideos();
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

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
</style>
