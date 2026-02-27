<template>
  <div class="w-full h-full library">
    <t-tabs v-model="path">
      <t-tab-panel label="短片" value="/library/scene"></t-tab-panel>
<!--      <t-tab-panel label="电影" value="/library/movie"></t-tab-panel>-->
<!--      <t-tab-panel label="标记" value="/library/marker"></t-tab-panel>-->
      <t-tab-panel label="演员" value="/library/actor"></t-tab-panel>
      <t-tab-panel label="工作室" value="/library/studio"></t-tab-panel>
      <t-tab-panel label="标签" value="/library/tag"></t-tab-panel>
    </t-tabs>
    <div class="library-content">
      <router-view/>
    </div>
  </div>
</template>
<script lang="ts" setup>
const router = useRouter();

const path = ref('/library/scene');

watch(path, value => router.push(value), {immediate: true});
</script>
<style scoped lang="less">
.library {
  height: 100vh;

  .library-content {
    height: calc(100vh - 50px);
  }
}
</style>
