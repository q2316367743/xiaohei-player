<template>
  <div class="player-page">
    <header class="player-header">
      <div class="player-header__left">
        <t-button theme="primary" variant="text" shape="square" @click="goBack">
          <template #icon>
            <chevron-left-icon/>
          </template>
        </t-button>
        <div class="player-header__title">
          <span>{{ video?.title }}</span>
        </div>
        <t-button theme="primary" variant="text" shape="square">
          <template #icon>
            <edit-icon />
          </template>
        </t-button>
      </div>
    </header>

    <div class="player-container">
      <div class="video-info-panel-container">
        <VideoInfoPanel :video="video" :tags="tags" :actors="actors" :studio="studio"/>
      </div>
      <div class="video-content-container">
        <VideoPlayer v-if="video" :video="video"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ChevronLeftIcon, EditIcon} from 'tdesign-icons-vue-next';
import type {Video} from '@/entity/domain/Video.ts';
import type {Tag} from '@/entity/domain/Tag.ts';
import {getVideoById} from '@/service/VideoService.ts';
import VideoInfoPanel from './components/VideoInfoPanel.vue';
import VideoPlayer from './components/VideoPlayer.vue';

defineOptions({
  name: 'PlayerPage'
});

const route = useRoute();
const router = useRouter();
const videoId = route.params.id as string;

const video = ref<Video>();
const tags = ref<Tag[]>([]);
const actors = ref<string>('');
const studio = ref<string>('');

function goBack() {
  router.back();
}

onMounted(async () => {
  try {
    const videoData = await getVideoById(videoId);

    if (!videoData) {
      await router.replace('/');
      return;
    }

    // 处理数据
    video.value = videoData;

  } catch (error) {
    console.error('Failed to load video:', error);
    await router.replace('/');
  }
});
</script>

<style scoped lang="less">
@import "player.less";
</style>
