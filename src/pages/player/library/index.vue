<template>
  <sub-page-layout :title="video?.title">
    <template #action>

      <t-dropdown placement="bottom-right" trigger="click">
        <t-button theme="primary" variant="text" shape="square">
          <template #icon>
            <more-icon/>
          </template>
        </t-button>
        <t-dropdown-menu>
          <t-dropdown-item @click="handleEdit">
            <template #prefix-icon>
              <edit-icon/>
            </template>
            编辑
          </t-dropdown-item>
          <t-dropdown-item @click="handleScan">
            <template #prefix-icon>
              <scan-icon/>
            </template>
            扫描
          </t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
    </template>

    <div class="player-page">

      <div class="player-container">
        <div class="video-info-panel-container">
          <VideoInfoPanel v-if="video" :video="video" :markers @add-marker="handleAddMarker"
                          @click-marker="handleClickMarker"/>
        </div>
        <div class="video-content-container">
          <VideoPlayer v-if="video" :video="video" :markers ref="videoPlayerRef"/>
        </div>
      </div>
    </div>
  </sub-page-layout>
</template>

<script lang="ts" setup>
import {EditIcon, MoreIcon, ScanIcon} from 'tdesign-icons-vue-next';
import type {VideoView} from '@/entity/domain/Video.ts';
import {getVideoInfoById, listMarker, updateVideoStatus} from '@/service';
import {openLibraryVideoEdit} from "@/pages/player/library/func/LibraryVideoEdit.tsx";
import VideoInfoPanel from './components/VideoInfoPanel.vue';
import VideoPlayer from './components/VideoPlayer.vue';
import type {Marker} from "@/entity/domain/Marker.ts";
import {openAddVideoMarker} from "@/pages/player/library/func/LibraryMarkerEdit.tsx";
import {scanOneLibrary} from "@/module/library";
import MessageUtil from "@/util/model/MessageUtil.ts";

defineOptions({
  name: 'PlayerLibrary'
});

const route = useRoute();
const router = useRouter();
const videoId = route.params.id as string;

const video = ref<VideoView>();
const markers = ref(new Array<Marker>());

const videoPlayerRef = ref();


const initMarker = async () => {
  markers.value = await listMarker(videoId);
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

    await initMarker();

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

const handleScan = () => {
  scanOneLibrary(video.value!).then(async () => {
    MessageUtil.success('扫描成功');
    const videoData = await getVideoInfoById(videoId);
    video.value = videoData!;
  }).catch(e => {
    MessageUtil.error("扫描失败", e);
  })
}

const handleAddMarker = () => {
  if (!videoPlayerRef.value) return;
  const time = videoPlayerRef.value.getCurrentTime();
  openAddVideoMarker(video.value!, time, initMarker);
}
const handleClickMarker = (marker: Marker) => {
  if (!videoPlayerRef.value) return;
  videoPlayerRef.value.seekTo(marker.time);
}
</script>

<style scoped lang="less">
@import "less/player.less";
</style>
