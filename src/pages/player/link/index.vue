<template>
  <div class="link-player-page">
    <!-- 主内容区域 -->
    <div class="main-content" :class="{ 'has-sidebar': showSidebar }">
      <!-- 播放器容器 - 拟物风格外框 -->
      <div class="player-container">
        <!-- 播放器顶部装饰条 -->
        <div class="player-header">
          <div class="header-actions">
            <t-button
              variant="text"
              shape="square"
              class="skeuo-btn"
              @click="goBack"
            >
              <template #icon>
                <ArrowLeftIcon/>
              </template>
            </t-button>
          </div>
          <div class="header-title">链接播放器</div>
          <div class="header-actions">
          </div>
        </div>

        <!-- 播放器主体 -->
        <div class="player-body">
          <div ref="playerRef" class="artplayer"></div>

          <!-- 空状态提示 -->
          <div v-if="!url" class="empty-state">
            <div class="empty-icon">
              <VideoIcon/>
            </div>
            <div class="empty-text">暂无播放链接</div>
            <div class="empty-subtext">请通过参数传入 src 链接</div>
          </div>
        </div>

        <!-- 播放器底部信息栏 -->
        <div class="player-footer flex">
          <div class="url-display" v-if="url">
            <div class="url-label">播放链接:</div>
            <div class="url-value" @click="copyLink">{{ src }}</div>
          </div>
          <div class="ml-auto">
            <t-button
              theme="primary"
              shape="square"
              @click="toggleSidebar"
            >
              <template #icon>
                <ListNumberedIcon/>
              </template>
            </t-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 侧边栏 -->
    <div v-if="showSidebar" class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-title">文件列表</div>
        <t-button
          variant="text"
          shape="square"
          size="small"
          @click="toggleSidebar"
        >
          <t-icon name="close"/>
        </t-button>
      </div>
      <div class="sidebar-content">
        <div v-if="loading" class="loading-state">
          <t-loading size="small"/>
          <span>加载中...</span>
        </div>
        <div v-else-if="videoFiles.length === 0" class="empty-sidebar">
          <t-icon name="file-video"/>
          <span>当前目录无视频文件</span>
        </div>
        <div v-else class="file-list">
          <div
            v-for="(file, index) in videoFiles"
            :key="index"
            class="file-item"
            :class="{ 'active': file.path === src }"
            @click="playVideo(file.path)"
          >
            <video-icon/>
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-path">{{ file.path }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {readDir} from '@tauri-apps/plugin-fs';
import {dirname, join} from '@tauri-apps/api/path';
import {writeText} from "@tauri-apps/plugin-clipboard-manager";
import Artplayer from 'artplayer';
import {VideoIcon, ArrowLeftIcon, ListNumberedIcon} from 'tdesign-icons-vue-next';
import {getCurrentWindow} from '@tauri-apps/api/window';
import {playFlv, playM3u8} from '@/lib/artplayer';
import {MessagePlugin} from 'tdesign-vue-next';
import MessageUtil from "@/util/model/MessageUtil.ts";
import {useLibrarySettingStore} from "@/lib/store.ts";
import {revealItemInDir} from "@tauri-apps/plugin-opener";
import {convertFileSrcToUrl} from "@/lib/FileSrc.ts";

defineOptions({
  name: 'LinkPlayer'
});

const route = useRoute();
const router = useRouter();
const currentWindow = getCurrentWindow();

const playerRef = ref<HTMLDivElement>();
const player = ref<Artplayer>();
const showSidebar = ref(false);
const loading = ref(false);
const videoFiles = ref<Array<{ name: string; path: string }>>([]);

const type = ref(route.query.type as string);
const src = ref(route.query.src as string);
const url = ref('');

onMounted(() => {
  if (type.value === 'file') {
    url.value = convertFileSrcToUrl(src.value);
  } else {
    url.value = src.value;
  }
  initPlayer();
});

// 判断链接类型
const getVideoType = (url: string): string => {
  if (!url) return '';
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.endsWith('.flv')) return 'flv';
  if (lowerUrl.endsWith('.m3u8') || lowerUrl.includes('.m3u8')) return 'm3u8';
  if (lowerUrl.endsWith('.mp4')) return 'mp4';
  if (lowerUrl.endsWith('.webm')) return 'webm';
  if (lowerUrl.endsWith('.mkv')) return 'mkv';
  return 'mp4';
};

// 切换侧边栏
const toggleSidebar = async () => {
  showSidebar.value = !showSidebar.value;
  if (showSidebar.value && type.value === 'file' && src.value) {
    await loadVideoFiles();
  }
};

// 加载视频文件列表
const loadVideoFiles = async () => {
  if (type.value !== 'file' || !src.value) return;

  loading.value = true;
  try {
    const librarySetting = await useLibrarySettingStore().get();
    const videoExtname = librarySetting.videoExtname;
    const directory = await dirname(src.value);

    const entries = await readDir(directory);
    const videos = [];

    for (const entry of entries) {
      const fullPath = await join(directory, entry.name);
      const ext = fullPath.split('.').pop()?.toLowerCase();

      if (ext && videoExtname.includes(ext)) {
        videos.push({
          name: entry.name,
          path: fullPath
        });
      }
    }

    videoFiles.value = videos;
  } catch (error) {
    console.error('Failed to load video files:', error);
    MessageUtil.error('加载文件列表失败', error);
  } finally {
    loading.value = false;
  }
};

// 播放视频
const playVideo = (filePath: string) => {
  src.value = filePath;
  if (player.value) {
    player.value.destroy();
  }
  initPlayer();
};

const copyLink = async () => {
  if (!src.value) return;
  if (type.value === 'file') {
    await revealItemInDir(src.value);
    return;
  }
  try {
    await writeText(src.value);
    MessageUtil.success('链接已复制');
  } catch (error) {
    MessageUtil.error('复制失败', error);
  }
};

const goBack = () => {
  router.back();
};

const initPlayer = () => {
  if (!playerRef.value || !url.value) return;

  player.value = new Artplayer({
    container: playerRef.value,
    url: url.value,
    type: getVideoType(url.value),
    fullscreen: false,
    fullscreenWeb: false,
    volume: 0.7,
    muted: false,
    autoplay: true,
    pip: true,
    autoSize: false,
    autoMini: true,
    screenshot: true,
    setting: true,
    loop: false,
    flip: true,
    playbackRate: true,
    aspectRatio: true,
    miniProgressBar: true,
    theme: 'var(--td-brand-color)',
    lang: 'zh-cn',
    moreVideoAttr: {
      crossOrigin: 'anonymous',
      playsInline: true,
      controls: false,
      autoplay: false,
    },
    customType: {
      flv: playFlv,
      m3u8: playM3u8,
    },
    controls: [{
      name: 'fullscreen',
      position: 'right',
      html: `<span>全屏</span>`,
      click() {
        currentWindow.isFullscreen().then(v => {
          player.value!.fullscreenWeb = !v;
          currentWindow.setFullscreen(!v);
        });
      }
    }]
  });

  player.value.on('ready', () => {
    console.log('Link Player is ready');
  });

  player.value.on('fullscreenWeb', e => {
    if (!e) {
      currentWindow.setFullscreen(false);
    }
  });

  player.value.on('error', (error) => {
    console.error('Player error:', error);
    MessagePlugin.error('播放出错，请检查链接是否有效');
  });
};

onBeforeUnmount(() => {
  if (player.value) {
    player.value.destroy();
  }
});
</script>

<style scoped lang="less">
@import "less/link.less";
</style>
