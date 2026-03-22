<template>
  <img v-if="cover" :src="cover" class="file-cover" alt=""/>
  <video-icon v-else class="file-icon"/>
</template>
<script lang="ts" setup>
import type {FileBrowser} from "@/module/file";
import {VideoIcon} from "tdesign-icons-vue-next";

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  adapter: {
    type: Object as PropType<FileBrowser>,
    required: true
  }
});

const cover = computedAsync(async () => {
  if (props.src) {
    return props.adapter.getLink(props.src);
  }
  return props.src;
}, '');
</script>
<style scoped lang="less">

</style>
