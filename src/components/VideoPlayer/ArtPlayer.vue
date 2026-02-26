<template>
  <div class="art-player" ref="art-player"></div>
</template>
<script lang="ts" setup>
import {useArtPlayer} from "@/hooks/UseArtPlayer.ts";
import type Artplayer from "artplayer";

const props = defineProps({
  url: {
    type: String,
    required: true
  }
});
const emit = defineEmits(['next']);
const art = shallowRef<Artplayer>();
const videoRef = useTemplateRef('art-player');
let offFunc: (() => void) | null = null;


onMounted(async () => {
  if (!videoRef.value) return;
  const {instance, switchUrl, videoEnded} = useArtPlayer(videoRef.value);
  art.value = instance;
  const {off} = videoEnded.on(() => {
    emit('next');
  })
  offFunc = off;
  watch(() => props.url, async url => {
    switchUrl(url);
  }, {immediate: true})
});
onUnmounted(() => {
  offFunc?.();
})
</script>
<style scoped lang="less">
.art-player {
  width: 100vw;
  height: 100vh;
}
</style>
