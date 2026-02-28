<template>
  <div class="link-player-page">

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
          <t-button
            variant="text"
            shape="square"
            class="skeuo-btn"
            @click="copyLink"
          >
            <template #icon>
              <LinkIcon/>
            </template>
          </t-button>
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
          <div class="url-value">{{ url }}</div>
        </div>
        <div class="ml-auto">
          <t-button theme="primary" shape="square">
            <template #icon>
              <list-numbered-icon/>
            </template>
          </t-button>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import Artplayer from 'artplayer';
import {LinkIcon, VideoIcon, ArrowLeftIcon, ListNumberedIcon} from 'tdesign-icons-vue-next';
import {getCurrentWindow} from '@tauri-apps/api/window';
import {playFlv, playM3u8} from '@/lib/artplayer';
import {MessagePlugin} from 'tdesign-vue-next';
import MessageUtil from "@/util/model/MessageUtil.ts";
import {convertFileSrc} from "@tauri-apps/api/core";

defineOptions({
  name: 'LinkPlayer'
});

const route = useRoute();
const router = useRouter();
const currentWindow = getCurrentWindow();

const playerRef = ref<HTMLDivElement>();
const player = ref<Artplayer>();

const type = computed(() => route.query.type as string);
const src = computed(() => route.query.src as string);
const url = computed(() => {
  if (type.value === 'file') return convertFileSrc(src.value);
  return src.value;
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

const copyLink = async () => {
  if (!src.value) return;
  try {
    await navigator.clipboard.writeText(src.value);
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

onMounted(() => {
  initPlayer();
});

onBeforeUnmount(() => {
  if (player.value) {
    player.value.destroy();
  }
});
</script>

<style scoped lang="less">
@import "less/link.less";
</style>
