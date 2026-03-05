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
            <wd-cell title="演员" :value="actors || '-'" ellipsis/>
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

      <t-tab-panel label="文件信息" value="file">
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

      <t-tab-panel label="历史记录" value="history">
        <wd-cell-group title="播放统计" border>
          <wd-cell title="播放次数" :value="video?.play_count?.toString() || '0'"/>
          <wd-cell title="最后播放时间" :value="formatDate(video?.last_played_at)"/>
          <wd-cell title="恢复播放时间" :value="formatDuration(video?.resume_time || 0)"/>
        </wd-cell-group>

        <div class="mt-8px">
          <wd-cell-group title="状态信息" border>
            <wd-cell title="扫描状态" :value="scanStatusText"/>
            <wd-cell title="删除状态" :value="video?.is_deleted ? '已删除' : '正常'"/>
            <wd-cell v-if="video?.error_message" title="错误信息" :value="video?.error_message" ellipsis/>
          </wd-cell-group>
        </div>
      </t-tab-panel>

    </t-tabs>
  </div>
</template>

<script lang="ts" setup>
import type {VideoView} from '@/entity/domain/Video.ts';

defineOptions({
  name: 'VideoInfoPanel'
});

const props = defineProps<{
  video: VideoView;
}>();

const activeTab = ref('intro');

const studio = computed(() => props.video?.studio?.name || '-');

const actors = computed(() => {
  if (!props.video?.actors?.length) return '-';
  return props.video.actors
    .map(item => {
      const actorName = item.actor?.name || '';
      const roleName = item.role_name;
      return roleName ? `${actorName} (${roleName})` : actorName;
    })
    .filter(name => name)
    .join(', ') || '-';
});

const tags = computed(() => {
  if (!props.video?.tags?.length) return [];
  return props.video.tags.map(item => item.tag).filter(tag => tag);
});

const scanStatusText = computed(() => {
  const statusMap: Record<string, string> = {
    'pending': '等待中',
    'scanning': '扫描中',
    'completed': '已完成',
    'error': '错误'
  };
  return statusMap[props.video?.scan_status || 'pending'] || props.video?.scan_status || '-';
});

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
@import "../less/VideoInfoPanel";
</style>
