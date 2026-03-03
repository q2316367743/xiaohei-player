<template>
  <t-card size="small">
    <sub-title title="收藏库">
      <template #action>
        <t-button class="mt-8px" @click="addLibraryItemAdd()">新增目录</t-button>
      </template>
    </sub-title>
    <t-card>
      <div v-if="list.length > 0" class="flex gap-8px flex-wrap">
        <t-card v-for="item in list" :key="item.id" :cover="item.cover" theme="poster2" :style="{ width: '320px' }">
          <template #footer>
            <div class="flex items-center gap-8px">
              <lock-on-icon v-if="item.password" style="color: var(--td-error-color)"/>
              <div>{{ item.name }}</div>
            </div>
          </template>
          <template #actions>
            <t-dropdown :min-column-width="112" trigger="click">
              <t-button variant="text" shape="square">
                <more-icon/>
              </t-button>
              <t-dropdown-menu>
                <t-dropdown-item @click="updateLibraryPsd(item)">
                  <template #prefix-icon>
                    <lock-on-icon v-if="item.password"/>
                    <lock-off-icon v-else/>
                  </template>
                  {{ item.password ? '修改密码' : '设置密码' }}
                </t-dropdown-item>
                <t-dropdown-item theme="error" @click="removeLibraryWrap(item)">
                  <template #prefix-icon>
                    <delete-icon/>
                  </template>
                  删除
                </t-dropdown-item>
              </t-dropdown-menu>
            </t-dropdown>
          </template>
        </t-card>
      </div>
      <t-empty v-else title="空空如也"/>
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
import SubTitle from "@/components/PageTitle/SubTitle.vue";
import {getLibrarySetting, type LibrarySetting} from "@/entity/setting/LibrarySetting.ts";
import {useLibrarySettingStore} from "@/lib/store.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {logDebug} from "@/lib/log.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import type {LibraryEntity} from "@/entity/main/LibraryEntity.ts";
import {listLibrary} from "@/service";
import {DeleteIcon, LockOffIcon, LockOnIcon, MoreIcon} from "tdesign-icons-vue-next";
import {addLibraryDialog, openDeleteFolderLocal, openUpdateLibraryPassword} from "@/pages/setting/library/edit.tsx";

const data = ref<LibrarySetting>(getLibrarySetting());
const list = ref(new Array<LibraryEntity>());

const initList = async () => {
  list.value = await listLibrary();
}

onMounted(() => {
  useLibrarySettingStore().get()
    .then((res) => {
      console.log(res);
      data.value = res;
    })
    .catch(e => MessageUtil.error("获取数据失败", e));
  initList()
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
  addLibraryDialog(initList);
}
const updateLibraryPsd = (item: LibraryEntity) => {
  openUpdateLibraryPassword(item, initList);
}
const removeLibraryWrap = (item: LibraryEntity) => {
  openDeleteFolderLocal(item, initList);
}
</script>
<style scoped lang="less">

</style>
