<template>
  <t-layout class="h-100vh">
    <t-header class="player-header">
      <div class="flex gap-8px items-center h-32px p-12px pb-11px" style="border-bottom: 1px solid var(--td-border-level-1-color)">
        <t-button theme="primary" variant="text" shape="square" @click="goBack">
          <template #icon>
            <chevron-left-icon/>
          </template>
        </t-button>
        <div class="player-header__title">
          <span>{{ video?.title }}</span>
        </div>
      </div>
    </t-header>

    <t-content class="h-full">
      <t-layout class="h-full">
        <t-aside width="30vw">
          <VideoInfoPanel :video="video"/>
        </t-aside>
        <t-content>
          <VideoPlayer ref="videoPlayerRef" :video="video"/>
        </t-content>
      </t-layout>
    </t-content>

    <div class="player-container">
    </div>
  </t-layout>
</template>

<script lang="ts" setup>
import {ref, onMounted} from 'vue';
import {ChevronLeftIcon} from 'tdesign-icons-vue-next';
import type {Video} from '@/entity/domain/Video.ts';
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
const videoPlayerRef = ref<InstanceType<typeof VideoPlayer>>();

function goBack() {
  router.back();
}


onMounted(async () => {
  try {
    const videoData = await getVideoById(videoId);

    if (!videoData) {
      router.replace('/');
      return;
    }

    video.value = videoData;
    videoPlayerRef.value?.init();
  } catch (error) {
    console.error('Failed to load video:', error);
    router.replace('/');
  }
});
</script>

<style scoped lang="less">
@import "player.less";
</style>
