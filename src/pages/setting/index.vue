<template>
  <div class="w-full h-full setting">
    <t-tabs v-model="path">
      <t-tab-panel label="任务" value="/setting/task"></t-tab-panel>
      <t-tab-panel label="收藏库" value="/setting/library"></t-tab-panel>
      <t-tab-panel label="界面" value="/setting/interface"></t-tab-panel>
      <t-tab-panel label="元数据提供者" value="/setting/metadata"></t-tab-panel>
      <t-tab-panel label="系统" value="/setting/system"></t-tab-panel>
      <t-tab-panel label="插件" value="/setting/plugin"></t-tab-panel>
      <t-tab-panel label="日志" value="/setting/log"></t-tab-panel>
      <t-tab-panel label="关于" value="/setting/about"></t-tab-panel>
    </t-tabs>
    <div class="setting-content">
      <router-view/>
    </div>
    <t-back-top container=".setting-content" />
  </div>
</template>
<script lang="ts" setup>
const router = useRouter();

const path = ref('/setting/task');

watch(path, value => router.push(value), {immediate: true});
</script>
<style scoped lang="less">
.setting {
  height: 100vh;

  .setting-content {
    height: calc(100vh - 64px);
    overflow-y: auto;
    padding: 8px;
  }
}
</style>
