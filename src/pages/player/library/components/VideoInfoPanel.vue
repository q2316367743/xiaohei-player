<template>
  <div class="video-info-panel">
    <div class="video-meta-row">
      <span class="meta-create-time">创建于 {{ formatDate(video?.created_at) }}</span>
      <span class="meta-fps-resolution">{{ video?.fps }} 帧每秒 | {{ video?.height }}p</span>
    </div>
    
    <t-tabs v-model:value="activeTab" class="video-tabs">
      <t-tab-panel label="简介" value="intro">
        <t-form  labelAlign="left">
          <t-form-item label="创建日期">{{ formatDate(video?.created_at) }}</t-form-item>
          <t-form-item label="更新日期">{{ formatDate(video?.updated_at) }}</t-form-item>
          <t-form-item label="描述">{{ video?.description || '-' }}</t-form-item>
          <t-form-item label="发行日期">{{ video?.release_date || '-' }}</t-form-item>
          <t-form-item label="标签">
            <t-tag v-for="tag in tags" :key="tag.id" :style="{ backgroundColor: tag.color }" size="small">
              {{ tag.name }}
            </t-tag>
            <span v-if="!tags?.length">-</span>
          </t-form-item>
          <t-form-item label="演员">{{ actors || '-' }}</t-form-item>
          <t-form-item label="工作室">{{ studio || '-' }}</t-form-item>
        </t-form>
      </t-tab-panel>
      
      <t-tab-panel label="文件信息" value="file">
        <t-form labelWidth="70px" labelAlign="left">
          <t-form-item label="时长">{{ formatDuration(video?.duration_ms || 0) }}</t-form-item>
          <t-form-item label="大小">{{ formatSize(video?.file_size || 0) }}</t-form-item>
          <t-form-item label="分辨率">{{ video?.width }} x {{ video?.height }}</t-form-item>
          <t-form-item label="帧率">{{ video?.fps }} 帧每秒</t-form-item>
          <t-form-item label="比特率">{{ formatBitrate(video?.bit_rate || 0) }}</t-form-item>
          <t-form-item label="视频编码">{{ video?.video_codec }}</t-form-item>
          <t-form-item label="音频编码">{{ video?.audio_codec }}</t-form-item>
          <t-form-item label="容器格式">{{ video?.container_format }}</t-form-item>
        </t-form>
      </t-tab-panel>
      
      <t-tab-panel label="历史记录" value="history">
        <div class="empty-content">暂无历史记录</div>
      </t-tab-panel>
      
    </t-tabs>
  </div>
</template>

<script lang="ts" setup>
import type {Video} from '@/entity/domain/Video.ts';
import type {Tag} from '@/entity/domain/Tag.ts';

defineOptions({
  name: 'VideoInfoPanel'
});

defineProps<{
  video?: Video;
  tags?: Tag[];
  actors?: string;
  studio?: string;
}>();

const activeTab = ref('intro');

function formatDate(timestamp?: number): string {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN');
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

function formatBitrate(bitrate?: number): string {
  if (!bitrate) return '-';
  if (bitrate < 1000000) {
    return `${(bitrate / 1000).toFixed(0)} kbps`;
  }
  return `${(bitrate / 1000000).toFixed(1)} Mbps`;
}
</script>

<style scoped lang="less">
@import "less/VideoInfoPanel";
</style>
