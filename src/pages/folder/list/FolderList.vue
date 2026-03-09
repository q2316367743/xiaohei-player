<template>
  <app-tool-layout title="文件夹">
    <div class="folder-local-container">
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
              <t-dropdown trigger="click">
                <t-button variant="outline" shape="circle" @click.stop>
                  <more-icon/>
                </t-button>
                <t-dropdown-menu>
                  <t-dropdown-item @click="openUpdateLocalPassword(item, loadList)">修改密码</t-dropdown-item>
                  <t-dropdown-item theme="error" @click="openDeleteFolderLocal(item, loadList)">删除</t-dropdown-item>
                </t-dropdown-menu>
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
        <div class="folder-card add" @click="handleContextmenu()">
          <div class="folder-icon-wrapper">
            <add-icon size="48px" class="folder-icon"/>
          </div>
        </div>
      </div>
      <empty-result v-else tip="暂无文件夹">
        <t-button theme="primary" @click="handleContextmenu()">
          <template #icon>
            <add-icon/>
          </template>
          新增文件夹
        </t-button>
      </empty-result>
    </div>
  </app-tool-layout>
</template>

<script lang="ts" setup>
import {addFolderDialog, openUpdateLocalPassword, openDeleteFolderLocal} from "../components/edit.tsx";
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
    });
    return;
  }
  router.push(`/folder/detail/${item.id}`);
}

const handleContextmenu = () => {
  // e.preventDefault();
  // e.stopPropagation();
  // Cxt.showContextMenu({
  //   x: e.x,
  //   y: e.y,
  //   theme: isDark.value ? 'mac dark' : 'mac',
  //   items: [{
  //     label: 'WebDAV',
  //     onClick: () => {
  //       handleAddFolder('webdav')
  //     }
  //   }, {
  //     label: '本地',
  //     onClick: () => {
  //       handleAddFolder('local')
  //     }
  //   }]
  // })
  handleAddFolder('local');
}
</script>

<style scoped lang="less">
@import "less/local.less";
</style>
