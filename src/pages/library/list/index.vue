<template>
  <div class="library-local-container">
    <div class="library-grid" v-if="list.length > 0">
      <div
        v-for="item in list"
        :key="item.id"
        class="library-card"
        @click="handleClick(item)"
      >
        <div class="library-cover">
          <lock-on-icon v-if="item.password" class="lock-icon"/>
          <img v-if="item.cover" :src="item.cover" :alt="item.name" class="cover-image">
          <div v-else class="default-cover">
            <video-icon class="default-icon"/>
          </div>
        </div>
        <div class="library-info">
          <div class="library-name" :title="item.name">{{ item.name }}</div>
        </div>
      </div>
    </div>

    <empty-result v-else tip="暂无收藏库"/>
  </div>
</template>

<script lang="ts" setup>
import {LockOnIcon, VideoIcon} from "tdesign-icons-vue-next";
import type {LibraryEntity} from "@/entity/main/LibraryEntity.ts";
import {listLibrary} from "@/service";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {checkMd5Password} from "@/util/lang/CryptoUtil.ts";

const router = useRouter();

const list = ref(new Array<LibraryEntity>());

const initList = async () => {
  list.value = await listLibrary();
}

onMounted(() => {
  initList();
})

const handleClick = (item: LibraryEntity) => {
  if (item.password) {
    MessageBoxUtil.prompt("", "请输入密码", {inputType: 'password'}).then(psd => {
      checkMd5Password(psd, item.password).then(res => {
        if (res) {
          router.push(`/library/detail/${item.id}`);
        } else {
          MessageUtil.error("密码错误");
        }
      })
    })
  } else {
    router.push(`/library/detail/${item.id}`);
  }
}
</script>

<style scoped lang="less">
@import "less/local.less";
</style>
