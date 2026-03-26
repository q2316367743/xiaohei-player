<template>
  <t-card size="small" class="setting-card">
    <sub-title title="收藏库">
      <template #action>
        <t-button class="mt-8px" @click="addLibraryItemAdd()">新增目录</t-button>
      </template>
    </sub-title>
    <t-card>
      <t-table :data="list" :columns="columns" row-key="id" size="small">
        <template #encrypted="{ row }">
          <lock-on-icon v-if="row.password" style="color: var(--td-error-color)"/>
          <lock-off-icon v-else style="color: var(--td-text-color-placeholder)"/>
        </template>
        <template #operation="{ row }">
          <t-space>
            <t-link theme="primary" @click="updateLibraryPsd(row)">
              {{ row.password ? '修改密码' : '设置密码' }}
            </t-link>
            <t-link theme="danger" @click="removeLibraryWrap(row)">删除</t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>
    <sub-title title="媒体的文件拓展名"/>
    <t-card>
      <t-list size="small" split>
        <t-list-item>
          <t-list-item-meta title="扫描视频拓展名">
            <template #description>
              <div>{{ data.scanExtname.join(',') }}</div>
              <div>扫描视频文件扩展名列表，扫描时匹配的文件将被标识为视频。</div>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onVideoExtnameEdit()">编辑</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="打开视频拓展名">
            <template #description>
              <div>{{ data.openExtname.join(',') }}</div>
              <div>打开视频拓展名列表，控制打开文件时可选择的文件类型。</div>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onImageExtnameEdit()">编辑</t-button>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
    <sub-title title="不包括"/>
    <t-card>
      目前没有任务在运行
    </t-card>
  </t-card>
</template>
<script lang="tsx" setup>
import {LockOffIcon, LockOnIcon} from "tdesign-icons-vue-next";
import SubTitle from "@/components/PageTitle/SubTitle.vue";
import {getLibrarySetting, type LibrarySetting} from "@/entity";
import {useLibrarySettingStore} from "@/lib/store.ts";
import {logDebug} from "@/lib/log.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import type {LibraryEntity} from "@/entity/main/LibraryEntity.ts";
import {addLibraryDialog, openDeleteFolderLocal, openUpdateLibraryPassword} from "@/pages/setting/library/edit.tsx";
import {useLibraryStore} from "@/store";

const data = ref<LibrarySetting>(getLibrarySetting());
const list = computed(() => useLibraryStore().libraries);

const columns = [
  { colKey: 'name', title: '名称', ellipsis: true },
  { colKey: 'encrypted', title: '是否加密', width: 120, cell: 'encrypted' },
  { colKey: 'operation', title: '操作', width: 160, cell: 'operation' },
];

onMounted(() => {
  useLibrarySettingStore().get()
    .then((res) => {
      console.log(res);
      data.value = res;
    })
    .catch(e => MessageUtil.error("获取数据失败", e));
})

function onChange<K extends keyof LibrarySetting>(key: K, value: any) {
  useLibrarySettingStore()
    .setItem(key, value)
    .then(() => logDebug("保存成功"))
    .catch(e => MessageUtil.error("保存失败", e));
}

const onVideoExtnameEdit = () => {
  console.log(data.value)
  MessageBoxUtil.tagPrompt("扫描视频文件扩展名列表，扫描时匹配的文件将被标识为视频。", "扫描视频拓展名", {
    initValue: data.value.scanExtname
  }).then((res) => {
    onChange('scanExtname', res);
    data.value.scanExtname = res;
  })
}
const onImageExtnameEdit = () => {
  MessageBoxUtil.tagPrompt("打开视频拓展名列表，控制打开文件时可选择的文件类型。", "打开视频拓展名", {
    initValue: data.value.openExtname
  }).then((res) => {
    onChange('openExtname', res);
    data.value.openExtname = res;
  })
}

const addLibraryItemAdd = () => {
  addLibraryDialog(() => useLibraryStore().init());
}
const updateLibraryPsd = (item: LibraryEntity) => {
  openUpdateLibraryPassword(item, () => useLibraryStore().init());
}
const removeLibraryWrap = (item: LibraryEntity) => {
  openDeleteFolderLocal(item, () => useLibraryStore().init());
}
</script>
<style scoped lang="less">

</style>
