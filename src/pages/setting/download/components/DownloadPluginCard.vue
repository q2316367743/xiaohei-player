<template>
  <t-card>
    <t-table :columns="columns" :data="plugins">
      <template #platform="{ row }">
        <t-space size="small" wrap>
          <t-tag v-for="platform in row.platform" :key="platform" size="small">
            {{ DownloadPluginPlatformMap[platform] }}
          </t-tag>
        </t-space>
      </template>
      <template #action="{ row }">
        <t-space size="small">
          <t-button theme="primary" size="small" @click="editPlugin(row)">
            编辑
          </t-button>
          <t-button theme="danger" size="small" @click="deletePlugin(row)">
            删除
          </t-button>
        </t-space>
      </template>
    </t-table>
    <t-empty v-if="plugins.length === 0" description="暂无插件"/>
  </t-card>
</template>
<script lang="ts" setup>
import {DownloadPluginPlatformMap, type DownloadPluginView} from "@/entity/main/DownloadPlugin.ts";
import {listDownloadPlugin} from "@/service";
import {
  addDownloadPluginDialog,
  deleteDownloadPluginDialog,
  updateDownloadPluginDialog
} from "@/pages/setting/download/edit.tsx";

const plugins = ref(new Array<DownloadPluginView>());

const columns = [
  {
    colKey: 'name',
    title: '名称',
  },
  {
    colKey: 'author',
    title: '作者',
    width: 120,
  },
  {
    colKey: 'version',
    title: '版本',
    width: 100,
  },
  {
    colKey: 'platform',
    title: '支持平台',
    width: 150,
  },
  {
    colKey: 'action',
    title: '操作',
    width: 150,
    fixed: 'right' as const,
  },
];

const initList = async () => {
  plugins.value = await listDownloadPlugin();
};

const editPlugin = (plugin: DownloadPluginView) => {
  updateDownloadPluginDialog(plugin, initList);
};

const deletePlugin = (plugin: DownloadPluginView) => {
  deleteDownloadPluginDialog(plugin, initList);
};

const addPlugin = () => {
  addDownloadPluginDialog(initList);
};

defineExpose({
  addPlugin
});

onMounted(initList);
</script>
<style scoped lang="less">

</style>
