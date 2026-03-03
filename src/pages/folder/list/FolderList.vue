<template>
  <div class="folder-local-container">
    <div class="header">
      <h2 class="title">文件夹</h2>
      <t-dropdown trigger="click">
        <t-button theme="primary">
          <template #icon>
            <add-icon/>
          </template>
          添加文件夹
        </t-button>
        <t-dropdown-menu>
          <t-dropdown-item @click="handleAddFolder('webdav')">WebDAV</t-dropdown-item>
          <t-dropdown-item @click="handleAddFolder('local')">本地</t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
    </div>

    <div class="folder-grid" v-if="list.length > 0">
      <div
        v-for="item in list"
        :key="item.id"
        class="folder-card"
        @click="handleClick(item)"
      >
        <div class="folder-cover">
          <lock-on-icon v-if="item.password" class="lock-icon"/>
          <div class="folder-icon-wrapper">
            <folder-icon class="folder-icon"/>
          </div>
          <div class="folder-actions">
            <t-dropdown :options="actionOptions" trigger="click"
                        @click="(data) => handleActionClick(data, item)">
              <t-button variant="outline" shape="circle" @click.stop>
                <more-icon/>
              </t-button>
            </t-dropdown>
          </div>
        </div>
        <div class="folder-info">
          <div class="folder-name" :title="item.name">{{ item.name || item.path }}</div>
        </div>
        <div class="folder-type">
          <t-tag theme="primary" variant="outline">
            <span v-if="item.type === 'local'">本地</span>
            <span v-else-if="item.type === 'webdav'">WebDAV</span>
          </t-tag>
        </div>
      </div>
    </div>

    <empty-result v-else tip="暂无文件夹"/>
  </div>
</template>

<script lang="ts" setup>
import {addFolderDialog, openUpdateLocalPassword, openDeleteFolderLocal} from "../components/edit.tsx";
import type {DropdownOption} from "tdesign-vue-next/es/dropdown/type";
import {AddIcon, FolderIcon, LockOnIcon, MoreIcon} from "tdesign-icons-vue-next";
import type {FolderType, FolderView} from "@/entity/main/Folder.ts";
import {listFolder} from "@/service";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {checkMd5Password} from "@/util/lang/CryptoUtil.ts";

const router = useRouter();


const list = ref(new Array<FolderView>());

const loadList = async () => {
  list.value = await listFolder();
};

onMounted(loadList);

function handleAddFolder(type: FolderType) {
  addFolderDialog(type, loadList);
}

const actionOptions: Array<DropdownOption> = [
  {
    content: '修改密码',
    value: 'password'
  },
  {
    content: '删除',
    value: 'delete',
    theme: 'error'
  }
];

function handleActionClick(data: any, folder: any) {
  if (data.value === 'password') {
    openUpdateLocalPassword(folder, loadList);
  } else if (data.value === 'delete') {
    openDeleteFolderLocal(folder, loadList);
  }
}

const handleClick = (item: FolderView) => {
  if (item.password) {
    // 请先输入密码
    MessageBoxUtil.prompt("", "请输入密码", {inputType: 'password'}).then(psd => {
      checkMd5Password(psd, item.password).then(res => {
        if (res) {
          router.push(`/folder/detail/${item.id}`);
        } else {
          MessageUtil.error("密码错误");
        }
      })
    })
  }
}
</script>

<style scoped lang="less">
@import "less/local.less";
</style>
