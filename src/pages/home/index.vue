<template>
  <div class="home-container">
    <div class="home-content">
      <div class="header-section">
        <div class="header-title">
          <span class="app-name">小黑影音</span>
          <span class="app-slogan">本地影音管理</span>
        </div>
        <div class="quick-actions">
          <t-button 
            class="quick-action-btn" 
            @click="handleOpenFile"
            variant="outline"
          >
            <template #icon><FolderIcon /></template>
            打开文件
          </t-button>
          <t-button 
            class="quick-action-btn" 
            @click="handleOpenUrl"
            variant="outline"
          >
            <template #icon><LinkIcon /></template>
            打开URL
          </t-button>
        </div>
      </div>

      <div class="statistics-section" v-if="overview">
        <div class="section-title">
          <span class="title-text">概览统计</span>
        </div>
        <div class="statistics-grid">
          <div class="stat-card">
            <div class="stat-icon video-icon">
              <VideoIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.total_videos }}</div>
              <div class="stat-label">视频总数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon duration-icon">
              <TimeFilledIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatDuration(overview.total_duration) }}</div>
              <div class="stat-label">总时长</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon size-icon">
              <DataBaseIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatSize(overview.total_size) }}</div>
              <div class="stat-label">总大小</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon like-icon">
              <HeartIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.liked_videos }}</div>
              <div class="stat-label">喜欢</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon actor-icon">
              <UserIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.total_actors }}</div>
              <div class="stat-label">演员</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon tag-icon">
              <DiscountIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.total_tags }}</div>
              <div class="stat-label">标签</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon studio-icon">
              <ShopIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.total_studios }}</div>
              <div class="stat-label">工作室</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon library-icon">
              <FolderIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.total_libraries }}</div>
              <div class="stat-label">收藏库</div>
            </div>
          </div>
        </div>
      </div>

      <div class="play-statistics-section" v-if="playSummary">
        <div class="section-title">
          <span class="title-text">播放统计</span>
        </div>
        <div class="play-statistics-grid">
          <div class="play-stat-card">
            <div class="play-stat-label">今日播放</div>
            <div class="play-stat-value">{{ playSummary.today_play_count }} 次</div>
            <div class="play-stat-duration">{{ formatDuration(playSummary.today_play_duration) }}</div>
          </div>
          <div class="play-stat-card">
            <div class="play-stat-label">本周播放</div>
            <div class="play-stat-value">{{ playSummary.week_play_count }} 次</div>
            <div class="play-stat-duration">{{ formatDuration(playSummary.week_play_duration) }}</div>
          </div>
          <div class="play-stat-card">
            <div class="play-stat-label">累计播放</div>
            <div class="play-stat-value">{{ playSummary.total_play_count }} 次</div>
            <div class="play-stat-duration">{{ formatDuration(playSummary.total_play_duration) }}</div>
          </div>
        </div>
      </div>

      <div class="chart-section" v-if="dailyStats.length > 0">
        <div class="section-title">
          <span class="title-text">最近7天播放趋势</span>
        </div>
        <div class="chart-container">
          <v-chart :option="chartOption" autoresize />
        </div>
      </div>

      <div class="top-videos-section" v-if="topVideos.length > 0">
        <div class="section-title">
          <span class="title-text">最常播放</span>
        </div>
        <div class="top-videos-list">
          <div 
            class="top-video-item" 
            v-for="(video, index) in topVideos" 
            :key="video.video_id"
            @click="handleVideoClick(video.video_id)"
          >
            <div class="rank" :class="{ 'top-three': index < 3 }">{{ index + 1 }}</div>
            <div class="video-cover-small">
              <t-image 
                v-if="video.video_cover" 
                :src="convertFileSrcToUrl(video.video_cover)" 
                fit="cover"
              />
              <div v-else class="no-cover">
                <VideoIcon />
              </div>
            </div>
            <div class="video-info-small">
              <div class="video-title-small">{{ video.video_title || '未知视频' }}</div>
              <div class="video-stats-small">
                播放 {{ video.play_count }} 次 · {{ formatDuration(video.total_duration) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="recent-section" v-if="recentVideos.length > 0">
        <div class="section-title">
          <span class="title-text">最近播放</span>
        </div>
        <div class="recent-videos-list">
          <div 
            class="recent-video-item" 
            v-for="video in recentVideos" 
            :key="video.id"
            @click="handleVideoClick(video.video_id)"
          >
            <div class="video-cover-small">
              <t-image 
                v-if="video.video_cover" 
                :src="convertFileSrcToUrl(video.video_cover)" 
                fit="cover"
              />
              <div v-else class="no-cover">
                <VideoIcon />
              </div>
            </div>
            <div class="video-info-small">
              <div class="video-title-small">{{ video.video_title || '未知视频' }}</div>
              <div class="video-stats-small">
                {{ formatTimeAgo(video.played_at) }} · {{ Math.round(video.progress_percent) }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { open } from '@tauri-apps/plugin-dialog';
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {useLibrarySettingStore} from "@/lib/store.ts";
import {FolderIcon, LinkIcon} from "tdesign-icons-vue-next";
import {
  VideoIcon,
  TimeFilledIcon,
  DataBaseIcon,
  HeartIcon,
  UserIcon,
  DiscountIcon,
  ShopIcon
} from 'tdesign-icons-vue-next';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';
import {getVideoStatisticsOverview, type VideoStatisticsOverview} from "@/service/video/VideoService.ts";
import {
  getPlayStatisticsSummary,
  getTopPlayedVideos,
  listRecentPlayHistory,
  getPlayTrendForLastDays,
  type PlayStatisticsSummary,
  type TopPlayedVideo,
  type PlayHistoryView,
  type PlayTrendView
} from "@/service/statistics/PlayHistoryService.ts";
import {convertFileSrcToUrl} from "@/lib/FileSrc.ts";
import dayjs from "dayjs";
import {formatDuration} from "@/util/lang/FormatUtil.ts";

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent]);

const router = useRouter();

const overview = ref<VideoStatisticsOverview | null>(null);
const playSummary = ref<PlayStatisticsSummary | null>(null);
const dailyStats = ref<Array<PlayTrendView>>([]);
const topVideos = ref<Array<TopPlayedVideo>>([]);
const recentVideos = ref<Array<PlayHistoryView>>([]);

const chartOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'var(--td-bg-color-container)',
    borderColor: 'var(--td-border-level-1-color)',
    textStyle: {
      color: 'var(--td-text-color-primary)'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: dailyStats.value.map(s => dayjs(s.date).format('MM-DD')),
    axisLine: {
      lineStyle: {
        color: 'var(--td-border-level-1-color)'
      }
    },
    axisLabel: {
      color: 'var(--td-text-color-secondary)'
    }
  },
  yAxis: {
    type: 'value',
    axisLine: {
      lineStyle: {
        color: 'var(--td-border-level-1-color)'
      }
    },
    axisLabel: {
      color: 'var(--td-text-color-secondary)'
    },
    splitLine: {
      lineStyle: {
        color: 'var(--td-border-level-1-color)',
        opacity: 0.3
      }
    }
  },
  series: [
    {
      name: '播放次数',
      type: 'line',
      smooth: true,
      data: dailyStats.value.map(s => s.play_count),
      lineStyle: {
        color: 'var(--td-brand-color)',
        width: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(214, 151, 30, 0.3)' },
            { offset: 1, color: 'rgba(214, 151, 30, 0.05)' }
          ]
        }
      },
      itemStyle: {
        color: 'var(--td-brand-color)'
      }
    }
  ]
}));

const handleOpenFile = async () => {
  const librarySetting = await useLibrarySettingStore().get();
  const selected = await open({
    multiple: false,
    filters: [
      { name: '视频文件', extensions: librarySetting.openExtname },
      { name: '所有文件', extensions: ['*'] }
    ]
  });
  if (selected) {
    await router.push({
      path: '/player/link',
      query: {
        type: 'file',
        src: selected
      }
    });
  }
};

const handleOpenUrl = () => {
  MessageBoxUtil.prompt("请输入您要播放的资源链接地址，一次仅可以识别1个链接", "打开链接", {
    confirmButtonText: '播放',
    cancelButtonText: '取消',
    inputPlaceholder: '支持HTTP、HTTPS链接，支持m3u8协议'
  }).then(url => {
    if (!url) return;
    router.push({
      path: '/player/link',
      query: {
        type: 'url',
        src: url
      }
    });
  })
};

const handleVideoClick = (videoId: string) => {
  router.push(`/player/library/${videoId}`);
};


const formatSize = (bytes: number): string => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
};

const formatTimeAgo = (timestamp: number): string => {
  const now = dayjs();
  const time = dayjs(timestamp);
  const diffMinutes = now.diff(time, 'minute');
  const diffHours = now.diff(time, 'hour');
  const diffDays = now.diff(time, 'day');
  
  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return time.format('MM-DD');
};

const loadStatistics = async () => {
  const [overviewData, playData, statsData, topData, recentData] = await Promise.all([
    getVideoStatisticsOverview(),
    getPlayStatisticsSummary(),
    getPlayTrendForLastDays(7),
    getTopPlayedVideos(5),
    listRecentPlayHistory(5)
  ]);
  
  overview.value = overviewData;
  playSummary.value = playData;
  dailyStats.value = statsData;
  topVideos.value = topData;
  recentVideos.value = recentData;
};

onMounted(() => {
  loadStatistics();
});
</script>

<style scoped lang="less">
.home-container {
  width: 100%;
  height: calc(100vh - 24px);
  overflow: auto;
  background-color: var(--td-bg-color-page);
  overflow-y: auto;
  padding: 24px 0;
}

.home-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.header-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .app-name {
    font-size: 24px;
    font-weight: 600;
    color: var(--td-text-color-primary);
  }
  
  .app-slogan {
    font-size: 13px;
    color: var(--td-text-color-secondary);
  }
}

.quick-actions {
  display: flex;
  gap: 12px;
}

.quick-action-btn {
  border-radius: var(--td-radius-medium);
  border: 1px solid var(--td-border-level-1-color);
  background: linear-gradient(145deg, var(--td-bg-color-container), var(--td-bg-color-secondarycontainer));
  box-shadow: var(--td-shadow-1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--td-shadow-2);
    background: linear-gradient(145deg, var(--td-bg-color-container-hover), var(--td-bg-color-secondarycontainer-hover));
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: var(--td-shadow-1);
  }
}

.section-title {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  
  .title-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--td-text-color-primary);
  }
}

.statistics-section {
  margin-bottom: 24px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(145deg, var(--td-bg-color-container), var(--td-bg-color-secondarycontainer));
  border-radius: var(--td-radius-large);
  border: 1px solid var(--td-border-level-1-color);
  box-shadow: var(--td-shadow-1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--td-shadow-2);
  }
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--td-radius-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  
  &.video-icon {
    background: rgba(214, 151, 30, 0.15);
    color: var(--td-brand-color);
  }
  
  &.duration-icon {
    background: rgba(0, 136, 88, 0.15);
    color: var(--td-success-color);
  }
  
  &.size-icon {
    background: rgba(213, 73, 65, 0.15);
    color: var(--td-error-color);
  }
  
  &.like-icon {
    background: rgba(227, 115, 24, 0.15);
    color: var(--td-warning-color);
  }
  
  &.actor-icon {
    background: rgba(214, 151, 30, 0.15);
    color: var(--td-brand-color);
  }
  
  &.tag-icon {
    background: rgba(0, 136, 88, 0.15);
    color: var(--td-success-color);
  }
  
  &.studio-icon {
    background: rgba(213, 73, 65, 0.15);
    color: var(--td-error-color);
  }
  
  &.library-icon {
    background: rgba(227, 115, 24, 0.15);
    color: var(--td-warning-color);
  }
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  margin-top: 2px;
}

.play-statistics-section {
  margin-bottom: 24px;
}

.play-statistics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
}

.play-stat-card {
  padding: 16px;
  background: linear-gradient(145deg, var(--td-bg-color-container), var(--td-bg-color-secondarycontainer));
  border-radius: var(--td-radius-large);
  border: 1px solid var(--td-border-level-1-color);
  box-shadow: var(--td-shadow-1);
  text-align: center;
}

.play-stat-label {
  font-size: 13px;
  color: var(--td-text-color-secondary);
  margin-bottom: 6px;
}

.play-stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--td-brand-color);
}

.play-stat-duration {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  margin-top: 2px;
}

.chart-section {
  margin-bottom: 24px;
}

.chart-container {
  height: 240px;
  background: linear-gradient(145deg, var(--td-bg-color-container), var(--td-bg-color-secondarycontainer));
  border-radius: var(--td-radius-large);
  border: 1px solid var(--td-border-level-1-color);
  box-shadow: var(--td-shadow-1);
  padding: 12px;
}

.top-videos-section,
.recent-section {
  margin-bottom: 24px;
}

.top-videos-list,
.recent-videos-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.top-video-item,
.recent-video-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: linear-gradient(145deg, var(--td-bg-color-container), var(--td-bg-color-secondarycontainer));
  border-radius: var(--td-radius-medium);
  border: 1px solid var(--td-border-level-1-color);
  box-shadow: var(--td-shadow-1);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: var(--td-shadow-2);
  }
}

.rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  background: var(--td-bg-color-component);
  color: var(--td-text-color-secondary);
  
  &.top-three {
    background: var(--td-brand-color);
    color: #fff;
  }
}

.video-cover-small {
  width: 64px;
  height: 36px;
  border-radius: var(--td-radius-default);
  overflow: hidden;
  background: var(--td-bg-color-page);
  flex-shrink: 0;
  
  .t-image {
    width: 100%;
    height: 100%;
  }
  
  .no-cover {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--td-text-color-placeholder);
    font-size: 16px;
  }
}

.video-info-small {
  flex: 1;
  min-width: 0;
}

.video-title-small {
  font-size: 13px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-stats-small {
  font-size: 11px;
  color: var(--td-text-color-secondary);
  margin-top: 2px;
}
</style>
