<template>
  <div class="w-full h-full setting">
    <div class="setting-wrapper">
      <!-- 内容区域 -->
      <div class="setting-content" :style="contentStyle">
        <router-view />
      </div>
    </div>
    <t-back-top container=".setting-content"/>
  </div>
</template>
<script lang="ts" setup>
const route = useRoute();


const contentStyle = computed(() => {
  if (route.path === '/setting/about') {
    return {
      overflow: 'hidden',
      padding: 0,
      height: '100vh'
    }
  }
  return {};
});

</script>
<style scoped lang="less">
.setting {
  height: 100vh;

  .setting-content {
    height: calc(100vh - 16px);
    overflow-y: auto;
    padding: 8px;
  }

  :deep(.setting-card) {
    & > .t-card__body {
      padding-top: 0 !important;
    }
  }
}
</style>
