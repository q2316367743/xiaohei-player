<template>
  <t-card size="small" class="setting-card">
    <sub-title title="插件">
      <template #action>
        <t-button class="mt-8px" @click="addPlugin()">新增插件</t-button>
      </template>
    </sub-title>
    <download-plugin-card ref="downloadPluginRef"/>
    <sub-title title="下载目录"/>
    <DownloadSettingCard />
  </t-card>
</template>
<script lang="ts" setup>
import DownloadPluginCard from "@/pages/setting/download/components/DownloadPluginCard.vue";
import DownloadSettingCard from "@/pages/setting/download/components/DownloadSettingCard.vue";

const downloadPluginRef = ref<InstanceType<typeof DownloadPluginCard>>();

const addPlugin = () => {
  downloadPluginRef.value?.addPlugin();
};
</script>
<style scoped lang="less">

</style>
