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
              <folder-icon v-if="item.type === 'local'" class="folder-icon"/>
              <WebDAVIcon v-else-if="item.type === 'webdav'" class="webdav-icon"/>
              <OpenListIcon v-else-if="item.type === 'open_list'" class="folder-icon"/>
            </div>
            <div class="folder-actions">
              <t-dropdown trigger="click">
                <t-button variant="outline" shape="circle" @click.stop>
                  <more-icon/>
                </t-button>
                <t-dropdown-menu>
                  <t-dropdown-item @click="openUpdateLocalPassword(item, loadList)">修改密码</t-dropdown-item>
                  <t-dropdown-item @click="openUpdateFolder(item, loadList)">更新</t-dropdown-item>
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
              <span v-else-if="item.type === 'smb'">SMB</span>
              <span v-else-if="item.type === 'open_list'">OpenList</span>
            </t-tag>
          </div>
        </div>
        <div class="folder-card add" @click="handleContextmenu($event)">
          <div class="folder-icon-wrapper">
            <add-icon size="48px" class="folder-icon"/>
          </div>
        </div>
      </div>
      <empty-result v-else tip="暂无文件夹">
        <t-button theme="primary" @click="handleContextmenu($event)">
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
import {AddIcon, FolderIcon, LockOnIcon, MoreIcon} from "tdesign-icons-vue-next";
import type {FolderView} from "@/entity";
import {listFolder} from "@/service";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {checkMd5Password} from "@/util/lang/CryptoUtil.ts";
import {
  openUpdateLocalPassword,
  openDeleteFolderLocal,
  handleFolderContextmenu, openUpdateFolder
} from "@/pages/folder/list/components/edit.tsx";
import OpenListIcon from "@/assets/icon/OpenListIcon.vue";
import WebDAVIcon from "@/assets/icon/WebDAVIcon.vue";

const router = useRouter();


const list = ref(new Array<FolderView>());

const loadList = async () => {
  list.value = await listFolder();
};

onMounted(loadList);


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

const handleContextmenu = (e: MouseEvent) => {
  handleFolderContextmenu(e, loadList);
}
</script>

<style scoped lang="less">
@import "less/local.less";
</style>
