<template>
  <div class="folder-player-page">
    <!-- 主内容区域 -->
    <div class="main-content" :class="{ 'has-sidebar': showSidebar }">
      <!-- 播放器容器 - 拟物风格外框 -->
      <div class="player-container">
        <!-- 播放器顶部装饰条 -->
        <div class="player-header">
          <div class="header-actions">
            <t-button
              theme="default"
              shape="square"
              @click="goBack"
            >
              <template #icon>
                <ArrowLeftIcon/>
              </template>
            </t-button>
          </div>
          <div class="header-title ellipsis">{{ title }}</div>
          <div class="header-actions">
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

        <!-- 播放器主体 -->
        <div class="player-body">
          <div ref="playerRef" class="artplayer"></div>

          <!-- 空状态提示 -->
          <empty-result v-if="!url" class="empty-state" tip="暂无播放链接" title="请通过参数传入 src 链接"/>
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
          <close-icon/>
        </t-button>
      </div>
      <div class="sidebar-content">
        <div v-if="loading" class="loading-state">
          <t-loading size="small"/>
          <span>加载中...</span>
        </div>
        <div v-else-if="videoFiles.length === 0" class="empty-sidebar">
          <video-icon/>
          <span>当前目录无视频文件</span>
        </div>
        <div v-else class="file-list">
          <div
            v-for="(file, index) in videoFiles"
            :key="index"
            class="file-item"
            :title="file.name"
            :class="{ 'active': file.path === src }"
            @click="playVideo(file)"
          >
            <div class="file-icon">
              <folder-image v-if="adapter" :adapter="adapter" :src="file.cover"/>
            </div>
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
import Artplayer from 'artplayer';
import {VideoIcon, ArrowLeftIcon, ListNumberedIcon, CloseIcon} from 'tdesign-icons-vue-next';
import {getCurrentWindow} from '@tauri-apps/api/window';
import {getVideoType, playFlv, playM3u8, playTs} from '@/lib/artplayer';
import {MessagePlugin} from 'tdesign-vue-next';
import MessageUtil from "@/util/model/MessageUtil.ts";
import {useLibrarySettingStore} from "@/lib/store.ts";
import {basename, dirname} from "@/util/lang/FileUtil.ts";
import {createFileBrowser} from "@/service";
import type {FileBrowser, FileItem} from "@/module/file";
import {filterVideoFileList} from "@/module/file/util.ts";
import {isTauri} from "@tauri-apps/api/core";

defineOptions({
  name: 'LinkPlayer'
});

const route = useRoute();
const router = useRouter();
const currentWindow = getCurrentWindow();

const adapter = shallowRef<FileBrowser>();
const playerRef = ref<HTMLDivElement>();
const player = ref<Artplayer>();
const showSidebar = ref(false);
const loading = ref(false);
const videoFiles = ref<Array<FileItem>>([]);
const folderExtname = ref<string[]>([]);

const folderId = ref(route.query.folderId as string);
const src = ref(route.query.src as string);
// 播放链接
const url = ref('');

const title = ref(basename(src.value));

async function loadSettings() {
  const settings = await useLibrarySettingStore().get();
  folderExtname.value = settings.folderExtname || [];
}

// 切换侧边栏
const toggleSidebar = async () => {
  showSidebar.value = !showSidebar.value;
};

// 加载视频文件列表
const loadVideoFiles = async () => {

  loading.value = true;
  try {
    const list = await adapter.value!.list(dirname(src.value));
    videoFiles.value = await filterVideoFileList(list, folderExtname.value);
  } catch (error) {
    console.error('Failed to load video files:', error);
    MessageUtil.error('加载文件列表失败', error);
  } finally {
    loading.value = false;
  }
};

// 播放视频
const playVideo = async (item: FileItem) => {
  src.value = item.path;
  url.value = await adapter.value!.getLink(src.value);
  title.value = item.name
  if (player.value) {
    player.value.destroy();
  }
  initPlayer();
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
    fullscreen: !isTauri(),
    fullscreenWeb: !isTauri(),
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
      ts: playTs,
    },
    controls: isTauri() ? [{
      name: 'fullscreen',
      position: 'right',
      html: `<span>全屏</span>`,
      click() {
        currentWindow.isFullscreen().then(v => {
          player.value!.fullscreenWeb = !v;
          currentWindow.setFullscreen(!v);
        });
      }
    }] : []
  }, art => {
    art.on('fullscreenWeb', e => {
      if (!e) {
        currentWindow.setFullscreen(false);
      }
    });

    art.on('error', (error) => {
      console.error('Player error:', error);
      MessagePlugin.error('播放出错，请检查链接是否有效');
    });
  });


};

onMounted(async () => {

  const fb = await createFileBrowser(folderId.value);
  if (!fb) {
    MessageUtil.error('未找到该文件');
    router.back();
    return;
  }
  await fb.init();
  adapter.value = fb;
  url.value = await fb.getLink(src.value);

  initPlayer();
  await loadSettings();
  // 加载视频文件列表
  await loadVideoFiles();
});

onBeforeUnmount(() => {
  if (player.value) {
    player.value.destroy();
  }
});
</script>

<style scoped lang="less">
@import "less/folder.less";
</style>
