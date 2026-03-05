<template>
  <div class="player-page">
    <header class="player-header">
      <div class="player-header__left">
        <t-button theme="default" shape="square" @click="goBack">
          <template #icon>
            <chevron-left-icon/>
          </template>
        </t-button>
        <div class="player-header__title">
          <span>{{ video?.title }}</span>
        </div>
        <t-button theme="primary" variant="text" shape="square" @click="handleEdit">
          <template #icon>
            <edit-icon/>
          </template>
        </t-button>
      </div>
    </header>

    <div class="player-container">
      <div class="video-info-panel-container">
        <VideoInfoPanel v-if="video" :video="video"/>
      </div>
      <div class="video-content-container">
        <VideoPlayer v-if="video" :video="video"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ChevronLeftIcon, EditIcon} from 'tdesign-icons-vue-next';
import type {VideoView} from '@/entity/domain/Video.ts';
import {getVideoInfoById, updateVideoStatus} from '@/service';
import {openLibraryVideoEdit} from "@/pages/player/library/func/LibraryVideoEdit.tsx";
import VideoInfoPanel from './components/VideoInfoPanel.vue';
import VideoPlayer from './components/VideoPlayer.vue';

defineOptions({
  name: 'PlayerPage'
});

const route = useRoute();
const router = useRouter();
const videoId = route.params.id as string;

const video = ref<VideoView>();

function goBack() {
  router.back();
}

onMounted(async () => {
  try {
    const videoData = await getVideoInfoById(videoId);

    if (!videoData) {
      await router.replace('/');
      return;
    }

    // 处理数据
    video.value = videoData;

    // 更新播放状态
    await updateVideoStatus(videoId, {
      last_played_at: Date.now(),
      play_count: videoData.play_count + 1
    })

  } catch (error) {
    console.error('Failed to load video:', error);
    await router.replace('/');
  }
});

const handleEdit = () => {
  openLibraryVideoEdit(videoId, async () => {
    const videoData = await getVideoInfoById(videoId);
    video.value = videoData!;
  })
}
</script>

<style scoped lang="less">
@import "less/player.less";
</style>
