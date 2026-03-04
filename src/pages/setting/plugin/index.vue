<template>
  <t-card size="small" class="setting-card">
    <sub-title title="下载插件">
      <template #action>
        <t-button class="mt-8px" @click="addPlugin()">新增插件</t-button>
      </template>
    </sub-title>
    <download-plugin ref="downloadPluginRef"/>
    <sub-title title="第三方插件"/>
    <t-card size="small">规划中</t-card>
  </t-card>
</template>
<script lang="ts" setup>
import DownloadPlugin from "@/pages/setting/plugin/components/download-plugin.vue";

const downloadPluginRef = ref<InstanceType<typeof DownloadPlugin>>();

const addPlugin = () => {
  downloadPluginRef.value?.addPlugin();
};
</script>
<style scoped lang="less">

</style>
