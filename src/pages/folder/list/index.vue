<template>
  <div class="folder-local-container">
    <div class="header">
      <h2 class="title">文件夹</h2>
      <t-button
        @click="handleAddFolder"
      >
        <template #icon>
          <t-icon name="add"></t-icon>
        </template>
        添加文件夹
      </t-button>
    </div>

    <div class="folder-grid" v-if="list.length > 0">
      <div
        v-for="item in list"
        :key="item.id"
        class="folder-card"
        :title="item.path"
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
      </div>
    </div>

    <div class="empty-state" v-else>
      <t-icon name="folder-open" class="empty-icon"></t-icon>
      <p class="empty-text">暂无文件夹</p>
      <t-button theme="primary" @click="handleAddFolder">添加第一个文件夹</t-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {addFolderDialog, openUpdateLocalPassword, openDeleteFolderLocal} from "../components/edit.tsx";
import type {DropdownOption} from "tdesign-vue-next/es/dropdown/type";
import {FolderIcon, LockOnIcon, MoreIcon} from "tdesign-icons-vue-next";
import type {FolderType, FolderView} from "@/entity/domain/Folder.ts";
import {checkPassword, listFolder} from "@/service";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";

const route = useRoute();
const router = useRouter();

const type = route.params.type as FolderType;

const list = ref(new Array<FolderView>());

const loadList = async () => {
  list.value = await listFolder(type);
};

onMounted(loadList);

function handleAddFolder() {
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
    openDeleteFolderLocal(folder);
  }
}

const handleClick = (item: FolderView) => {
  if (item.password) {
    // 请先输入密码
    MessageBoxUtil.prompt("", "请输入密码", {inputType: 'password'}).then(psd => {
      checkPassword(psd, item).then(res => {
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
