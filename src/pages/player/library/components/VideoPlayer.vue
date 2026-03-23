<template>
  <div class="video-content">
    <div ref="playerRef" class="artplayer"></div>

    <KeyframesTimeline
      v-if="vttCues.length > 0 && showPreviewAxis"
      :vttCues="vttCues"
      :currentTime="currentTime"
      :duration="duration"
      :spriteUrl="spriteUrl"
      @seek="seekToTime"
    />
  </div>
</template>

<script lang="ts" setup>
import Artplayer from 'artplayer';
import type {VideoView} from '@/entity/domain/Video.ts';
import {readTextFile} from '@tauri-apps/plugin-fs';
import {parseVtt, type VttCue} from "@/util/file/VttParser.ts";
import {getCurrentWindow} from "@tauri-apps/api/window";
import {convertFileSrcToUrl} from "@/lib/FileSrc.ts";
import {getVideoType, playFlv, playM3u8, playTs} from "@/lib/artplayer.ts";
import {debounce} from "es-toolkit";
import {updateVideoStatus} from "@/service";
import KeyframesTimeline from "./KeyframesTimeline.vue";
import type {Marker} from "@/entity/domain/Marker.ts";
import {useInterfaceSettingStore} from "@/store";
import {isTauri} from "@tauri-apps/api/core";
import artplayerPluginMultipleSubtitles from "artplayer-plugin-multiple-subtitles";

defineOptions({
  name: 'VideoPlayer'
});

const props = defineProps<{
  video: VideoView;
  markers: Array<Marker>;
}>();

const currentWindow = getCurrentWindow();
const playerRef = ref<HTMLDivElement>();
const player = ref<Artplayer>();
const vttCues = ref<VttCue[]>([]);
const currentTime = ref(0);
const duration = ref(0);
const spriteUrl = ref('');

const showPreviewAxis = computed(() => useInterfaceSettingStore().showPreviewAxis);
const videoUrl = computed(() => convertFileSrcToUrl(props.video.file_path));
const posterUrl = computed(() => props.video.cover_path ? convertFileSrcToUrl(props.video.cover_path) : undefined);

async function loadVtt() {
  if (!props.video?.vtt_path) {
    return;
  }

  try {
    const content = await readTextFile(props.video.vtt_path);
    vttCues.value = parseVtt(content);
  } catch (error) {
    console.error('Failed to load VTT file:', error);
  }
}

const THUMBNAIL_HEIGHT = 90;

function getThumbnailStyle(cue: VttCue) {
  if (!spriteUrl.value) {
    return {};
  }
  const scale = THUMBNAIL_HEIGHT / cue.height;
  const displayWidth = cue.width * scale;
  const spriteWidth = 2880;
  const spriteHeight = 1620;

  return {
    backgroundImage: `url(${spriteUrl.value})`,
    backgroundPosition: `-${cue.x * scale}px -${cue.y * scale}px`,
    backgroundSize: `${spriteWidth * scale}px ${spriteHeight * scale}px`,
    width: `${displayWidth}px`,
    height: `${THUMBNAIL_HEIGHT}px`
  };
}

function findCueByTime(time: number): VttCue | null {
  return vttCues.value.find(cue =>
    time >= cue.startTime && time <= cue.endTime
  ) || null;
}


const updateResumeTime = debounce(async rt => {
  if (!props.video) return;
  await updateVideoStatus(props.video.id, {resume_time: rt})
}, 300);

function initPlayer() {
  if (!playerRef.value || !props.video) return;

  const p = new Artplayer({
    container: playerRef.value,
    url: videoUrl.value,
    poster: posterUrl.value,
    type: getVideoType(videoUrl.value),
    fullscreen: !isTauri(),
    fullscreenWeb: !isTauri(),
    volume: 0.7,
    isLive: false,
    muted: false,
    autoplay: false,
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
    theme: '#23ade5',
    lang: 'zh-cn',
    plugins: [
      // 全部字幕
      artplayerPluginMultipleSubtitles({
        subtitles: props.video.caption.map(caption => ({
          name: caption.label,
          url: convertFileSrcToUrl(caption.value),
        })),
      }),
    ],
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
    controls: [
      ...(vttCues.value.length > 0 && spriteUrl.value ? [{
        name: 'thumbnail',
        position: 'top' as const,
        index: 20,
        html: '<div class="art-control-thumbnails"></div>',
        style: {
          display: 'none',
          position: 'absolute',
          bottom: '100%',
          marginBottom: '10px',
          pointerEvents: 'none',
          zIndex: '100',
        },
        mounted($control: HTMLElement) {
          const art = this as unknown as Artplayer;

          art.on('setBar', (type: string, percentage: number) => {
            if (type === 'hover') {
              const second = percentage * art.duration;
              const cue = findCueByTime(second);

              if (cue) {
                const style = getThumbnailStyle(cue);
                $control.style.display = 'flex';
                $control.style.backgroundImage = style.backgroundImage as string;
                $control.style.backgroundPosition = style.backgroundPosition as string;
                $control.style.backgroundSize = style.backgroundSize as string;
                $control.style.width = style.width as string;
                $control.style.height = style.height as string;

                const progressWidth = art.template.$progress.clientWidth;
                const width = progressWidth * percentage;
                const scale = THUMBNAIL_HEIGHT / cue.height;
                const thumbWidth = cue.width * scale;

                if (width <= thumbWidth / 2) {
                  $control.style.left = '0px';
                } else if (width > progressWidth - thumbWidth / 2) {
                  $control.style.left = `${progressWidth - thumbWidth}px`;
                } else {
                  $control.style.left = `${width - thumbWidth / 2}px`;
                }
              } else {
                $control.style.display = 'none';
              }
            }
          });

          art.template.$progress.addEventListener('mouseleave', () => {
            $control.style.display = 'none';
          });
        }
      }] : []),
      ...(props.markers.length > 0 ? [{
        name: 'markers',
        position: 'top' as const,
        index: 21,
        html: '<div class="art-control-markers"></div>',
        style: {
          position: 'absolute',
          bottom: '100%',
          left: '0',
          right: '0',
          height: '12px',
          pointerEvents: 'none',
          zIndex: '50',
        },
        mounted($control: HTMLElement) {
          const art = this as unknown as Artplayer;

          function renderMarkers() {
            $control.innerHTML = '';
            const progressWidth = art.template.$progress.clientWidth;

            props.markers.forEach(marker => {
              const percentage = marker.time / art.duration;
              const left = percentage * progressWidth;

              const markerEl = document.createElement('div');
              markerEl.className = 'art-marker-point';
              markerEl.style.cssText = `
                position: absolute;
                left: ${left}px;
                top: 0;
                width: 8px;
                height: 8px;
                background: #ff6b6b;
                border-radius: 50%;
                transform: translateX(-50%);
                cursor: pointer;
                pointer-events: auto;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                transition: transform 0.2s, box-shadow 0.2s;
              `;

              markerEl.addEventListener('mouseenter', () => {
                markerEl.style.transform = 'translateX(-50%) scale(1.5)';
                markerEl.style.boxShadow = '0 4px 8px rgba(255, 107, 107, 0.5)';
              });

              markerEl.addEventListener('mouseleave', () => {
                markerEl.style.transform = 'translateX(-50%) scale(1)';
                markerEl.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
              });

              markerEl.addEventListener('click', () => {
                art.seek = marker.time;
              });

              const tooltip = document.createElement('div');
              tooltip.className = 'art-marker-tooltip';
              tooltip.textContent = marker.name;
              tooltip.style.cssText = `
                position: absolute;
                bottom: 14px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: #fff;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.2s;
                pointer-events: none;
              `;

              markerEl.appendChild(tooltip);

              markerEl.addEventListener('mouseenter', () => {
                tooltip.style.opacity = '1';
              });

              markerEl.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
              });

              $control.appendChild(markerEl);
            });
          }

          art.on('video:loadedmetadata', renderMarkers);
          art.on('resize', renderMarkers);

          setTimeout(renderMarkers, 100);
        }
      }] : []),
      ...(isTauri() ? [{
        name: 'fullscreen',
        position: 'right',
        html: `<span>全屏</span>`,
        click() {
          currentWindow.isFullscreen().then(v => {
            player.value!.fullscreenWeb = !v;
            currentWindow.setFullscreen(!v);
          })
        }
      }] : [])
    ],
    settings: [
      {
        width: 200,
        html: '字幕',
        tooltip: '字幕选项',
        // icon: '<img width="22" height="22" src="/assets/img/subtitle.svg">',
        selector: [
          {
            html: '显示',
            tooltip: '是否显示字幕',
            switch: true,
            onSwitch(item) {
              item.tooltip = item.switch ? '隐藏' : '显示'
              // 显示/隐藏字幕
              // Show/hide subtitles
              player.value!.subtitle.show = !item.switch
              return !item.switch
            },
          },
          ...props.video.caption.map((caption, index) => ({
            default: index === 0,
            html: caption.label,
            name: caption.label,
          })),
        ],
        onSelect(item) {
          // 显示单个字幕
          // Show single subtitle
          console.log('显示指定弹幕', item.name);
          console.log(player.value!.plugins)
          player.value!.plugins.multipleSubtitles?.tracks([item.name])
          return item.html
        },
      },
    ]
  }, art => {
    console.log('Player is ready');
    // 存在恢复时间，并且未设置从恢复时间开始播放
    if (props.video?.resume_time && !useInterfaceSettingStore().videoFromStart) {
      seekToTime(props.video.resume_time);
    }
    if (player.value?.video) {
      duration.value = player.value.video.duration || 0;
    }
    if (props.video.caption.length > 0) {
      // 显示第一个字幕
      art.plugins.multipleSubtitles?.tracks([props.video.caption[0]!.label])
    }
    art.on('video:timeupdate', () => {
      currentTime.value = art.currentTime;
      updateResumeTime(currentTime.value);
    });
    art.on('fullscreenWeb', e => {
      if (!e) {
        currentWindow.setFullscreen(false);
      }
    });
    art.on('error', (error) => {
      console.error('Player error:', error);
    });
  });
  player.value = markRaw(p);
}

function seekToTime(time: number) {
  if (player.value) {
    player.value.seek = time;
  }
}

function init() {
  if (props.video?.sprite_path) {
    spriteUrl.value = convertFileSrcToUrl(props.video.sprite_path);
  }
  loadVtt().then(() => {
    initPlayer();
  });
}

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  if (player.value) {
    player.value.destroy();
  }
});
defineExpose({
  getCurrentTime: () => currentTime.value,
  seekTo: (time: number) => {
    if (!player.value) return;
    player.value.seek = time;
  }
})
</script>

<style scoped lang="less">
@import "../less/VideoPlayer.less";
</style>
