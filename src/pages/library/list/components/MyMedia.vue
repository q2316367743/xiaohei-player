<template>
  <div class="my-media">
    <div class="library-title">我的媒体</div>
    <div class="library-grid" v-if="list.length > 0">
      <div
        v-for="item in list"
        :key="item.id"
        class="library-card"
        @click="handleClick(item)"
      >
        <div class="library-cover">
          <lock-on-icon v-if="item.password" class="lock-icon"/>
          <template v-if="!item.password && item.cover">
            <t-image
              :src="convertFileSrcToUrl(item.cover)"
              fit="cover"
              class="cover-image"
              @error="handleImageError(item)"
            >
              <template #error>
                <div class="default-cover">
                  <video-icon class="default-icon"/>
                </div>
              </template>
            </t-image>
          </template>
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
import {convertFileSrcToUrl} from "@/lib/FileSrc.ts";

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

const handleImageError = (item: LibraryEntity) => {
  item.cover = '';
}
</script>

<style scoped lang="less">
.library-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 16px;
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.library-card {
  border-radius: 8px;
  overflow: hidden;
  background: var(--td-bg-color-container);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
}

.library-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--td-bg-color-page);
  overflow: hidden;
}

.lock-icon {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 18px;
  color: var(--td-error-color);
}

.cover-image {
  width: 100%;
  height: 100%;
}

.default-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--td-bg-color-page);
}

.default-icon {
  font-size: 48px;
  color: var(--td-text-color-placeholder);
}

.library-info {
  padding: 12px;
}

.library-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
