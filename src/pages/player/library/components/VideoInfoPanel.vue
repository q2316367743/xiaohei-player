<template>
  <div class="video-info-panel">
    <div class="video-meta-row">
      <span class="meta-create-time">创建于 {{ formatDate(video?.created_at) }}</span>
      <span class="meta-fps-resolution">{{ video?.fps }} 帧每秒 | {{ video?.height }}p</span>
    </div>

    <t-tabs v-model:value="activeTab" class="video-tabs">
      <t-tab-panel label="简介" value="intro">
        <wd-cell-group title="基本信息" border>
          <wd-cell title="创建日期" :value="formatDate(video?.created_at)"/>
          <wd-cell title="更新日期" :value="formatDate(video?.updated_at)"/>
          <wd-cell title="发行日期" :value="video?.release_date || '-'"/>
          <wd-cell title="导演" :value="video?.director || '-'"/>
        </wd-cell-group>

        <div class="mt-8px">
          <wd-cell-group title="详细信息" border>
            <wd-cell title="描述" :value="video?.description || '-'" ellipsis/>
            <wd-cell title="链接" :value="video?.link || '-'" ellipsis/>
            <wd-cell title="工作室" :value="studio || '-'"/>
            <wd-cell title="演员">
              <div>
                <template v-for="(actor, index) in actors" :key="actor.id">
                  <span v-if="index > 0">、</span>
                  <t-link theme="primary" @click="handleClickActor(actor.actor.id)">{{ actor.actor.name }}</t-link>
                </template>
              </div>
            </wd-cell>
          </wd-cell-group>
        </div>

        <div class="mt-8px">
          <wd-cell-group title="标签" border class="mt-8px">
            <div class="tags-container">
              <t-tag v-for="tag in tags" :key="tag.id" :style="{ backgroundColor: tag.color }" size="small">
                {{ tag.name }}
              </t-tag>
              <span v-if="!tags?.length" class="empty-text">暂无标签</span>
            </div>
          </wd-cell-group>
        </div>
      </t-tab-panel>

      <t-tab-panel label="文件" value="file">
        <wd-cell-group title="视频信息" border>
          <wd-cell title="时长" :value="formatDuration(video?.duration_ms || 0)"/>
          <wd-cell title="大小" :value="formatSize(video?.file_size || 0)"/>
          <wd-cell title="分辨率" :value="`${video?.width} x ${video?.height}`"/>
          <wd-cell title="帧率" :value="`${video?.fps} 帧每秒`"/>
          <wd-cell title="比特率" :value="formatBitrate(video?.bit_rate || 0)"/>
        </wd-cell-group>

        <div class="mt-8px">
          <wd-cell-group title="编码信息" border>
            <wd-cell title="视频编码" :value="video?.video_codec || '-'"/>
            <wd-cell title="音频编码" :value="video?.audio_codec || '-'"/>
            <wd-cell title="容器格式" :value="video?.container_format || '-'"/>
          </wd-cell-group>
        </div>

        <div class="mt-8px">
          <wd-cell-group title="文件路径" border>
            <wd-cell title="文件名" :value="video?.file_name || '-'" ellipsis/>
            <wd-cell title="文件路径" :value="video?.file_path || '-'" ellipsis/>
            <wd-cell title="文件创建时间" :value="formatDate(video?.file_birthtime)"/>
          </wd-cell-group>
        </div>
      </t-tab-panel>

      <t-tab-panel label="历史" value="history">
        <wd-cell-group title="播放统计" border>
          <wd-cell title="播放次数" :value="video?.play_count?.toString() || '0'"/>
          <wd-cell title="最后播放时间" :value="formatDate(video?.last_played_at)"/>
          <wd-cell title="恢复播放时间" :value="formatDuration(video?.resume_time || 0)"/>
        </wd-cell-group>

        <div class="mt-8px">
          <wd-cell-group title="状态信息" border>
            <wd-cell title="删除状态" :value="video?.is_deleted ? '已删除' : '正常'"/>
            <wd-cell title="喜欢状态" :value="video?.is_liked ? '已删除' : '正常'"/>
          </wd-cell-group>
        </div>
      </t-tab-panel>

      <t-tab-panel label="标记" value="marker">
        <t-button theme="primary" @click="handleAddMarker()">创建标记</t-button>
        <t-empty v-if="markers.length === 0" title="暂无标记" class="mt-15vh"/>
        <div v-else class="marker-list">
          <div v-for="marker in markers" :key="marker.id" class="marker-item" @click="handleClickMarker(marker)">
            <div class="marker-image">
              <img :src="marker.image" :alt="marker.name" @error="handleImageError"/>
            </div>
            <div class="marker-content">
              <div class="marker-name">{{ marker.name }}</div>
              <div class="marker-description">{{ marker.description || '暂无描述' }}</div>
              <div class="marker-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: getProgressWidth(marker.time) }"></div>
                </div>
                <div class="progress-text">{{ formatDuration(marker.time) }}</div>
              </div>
            </div>
          </div>
        </div>
      </t-tab-panel>

      <t-tab-panel label="队列" value="list">
      </t-tab-panel>

    </t-tabs>
  </div>
</template>

<script lang="ts" setup>
import type {VideoView} from '@/entity/domain/Video.ts';
import type {Marker} from "@/entity/domain/Marker.ts";
import {formatDate} from "@/util/lang/FormatUtil.ts";

const router = useRouter();

defineOptions({
  name: 'VideoInfoPanel'
});

const props = defineProps<{
  video: VideoView;
  markers: Array<Marker>;
}>();

const emit = defineEmits(['addMarker', 'clickMarker']);

const activeTab = ref('intro');

const studio = computed(() => props.video?.studio?.name || '-');

const actors = computed(() => {
  if (!props.video?.actors?.length) return [];
  return props.video.actors
});

const tags = computed(() => {
  if (!props.video?.tags?.length) return [];
  return props.video.tags.map(item => item.tag).filter(tag => tag);
});


function formatDuration(timestamp: number): string {
  const seconds = Math.floor(timestamp / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${String((minutes % 60).toFixed(0)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return `${minutes}:${String((seconds % 60).toFixed(0)).padStart(2, '0')}`;
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

function formatBitrate(bitrate?: number): string {
  if (!bitrate) return '-';
  if (bitrate < 1000000) {
    return `${(bitrate / 1000).toFixed(0)} kbps`;
  }
  return `${(bitrate / 1000000).toFixed(1)} Mbps`;
}

function handleAddMarker() {
  emit('addMarker');
}

function handleClickMarker(marker: Marker) {
  emit('clickMarker', marker);
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = '/placeholder.png';
}

function getProgressWidth(markerTime: number): string {
  const totalDuration = props.video?.duration_ms || 1;
  const percentage = (markerTime / totalDuration) * 100;
  return `${Math.min(percentage, 100)}%`;
}

const handleClickActor = (actorId: string) => {
  router.push(`/library/actor/${actorId}`);
}
</script>

<style scoped lang="less">
@import "../less/VideoInfoPanel";
</style>
