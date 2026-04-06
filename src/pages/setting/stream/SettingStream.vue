<template>
  <t-card title="流媒体" size="small" class="setting-card">
    <template #actions>
      <t-button theme="primary" @click="handleAdd">
        <template #icon>
          <add-icon/>
        </template>
        新增
      </t-button>
    </template>
    <t-table
      :data="dataList"
      :columns="columns"
      :loading="loading"
      row-key="id"
      size="small"
      hover
    >
      <template #is_aggregate_search="{ row }">
        <t-tag :theme="row.is_aggregate_search === 1 ? 'success' : 'default'">
          {{ row.is_aggregate_search === 1 ? '是' : '否' }}
        </t-tag>
      </template>
      <template #type="{ row }">
        <t-tag>{{ NetworkServerTypeLabel[row.type as keyof typeof NetworkServerTypeLabel] || row.type }}</t-tag>
      </template>
      <template #format="{ row }">
        <t-tag theme="primary" variant="light">{{ row.format.toUpperCase() }}</t-tag>
      </template>
      <template #operation="{ row }">
        <t-space>
          <t-link theme="primary" hover="underline" @click="handleEdit(row)">编辑</t-link>
          <t-link theme="danger" hover="underline" @click="handleDelete(row.id)">删除</t-link>
        </t-space>
      </template>
    </t-table>
  </t-card>
</template>
<script lang="ts" setup>
import {AddIcon} from "tdesign-icons-vue-next";
import type {NetworkServer} from "@/entity";
import {NetworkServerTypeLabel} from "@/entity";
import {
  openAddNetworkServerDrawer,
  openDeleteNetworkServer,
  openEditNetworkServerDrawerFromServer
} from "./func.tsx";
import {useStreamStore} from "@/store";

const loading = ref(false);
const dataList = computed(() => useStreamStore().streamServers);

const columns = [
  {colKey: 'name', title: '名称'},
  {colKey: 'type', title: '类型', width: 120},
  {colKey: 'format', title: '格式', width: 80, align: 'center' as const},
  {colKey: 'is_aggregate_search', title: '聚合搜索', width: 100, align: 'center' as const},
  {colKey: 'sequence', title: '排序', width: 80},
  {colKey: 'operation', title: '操作', width: 150, align: 'center' as const}
];


const handleAdd = () => {
  openAddNetworkServerDrawer();
};

const handleEdit = (row: NetworkServer) => {
  openEditNetworkServerDrawerFromServer(row);
};

const handleDelete = (id: string) => {
  openDeleteNetworkServer(id);
};

</script>
<style scoped lang="less">
.setting-card {
  height: 100%;
}
</style>
