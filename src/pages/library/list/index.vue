<template>
  <app-tool-layout title="收藏库">
    <div class="library-local-container">
      <my-media/>
      <recently-watched/>
      <recently-added/>
    </div>
  </app-tool-layout>
</template>

<script lang="ts" setup>
import MyMedia from "./components/MyMedia.vue";
import RecentlyWatched from "./components/RecentlyWatched.vue";
import RecentlyAdded from "./components/RecentlyAdded.vue";
</script>

<style scoped lang="less">
.library-local-container {
  padding: 8px;
}
</style>
