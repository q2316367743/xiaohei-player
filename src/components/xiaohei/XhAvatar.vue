<template>
  <div
    class="xh-avatar"
    :class="[shape]"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img v-if="url" :src="url" :alt="modelValue"/>
    <div v-else class="placeholder">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>
    <input
      v-if="editable"
      type="file"
      ref="fileInput"
      accept="image/*"
      @change="handleFileChange"
      style="display: none"
    />
    <div v-if="editable" class="overlay" @click="triggerUpload">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {convertFileSrc} from "@tauri-apps/api/core";
import {BaseDirectory, join} from "@tauri-apps/api/path";
import {exists, mkdir, writeFile} from "@tauri-apps/plugin-fs";
import {useSnowflake} from "@/util";
import type {PropType} from "vue";
import {APP_DATA_ASSET_DIR} from "@/global/Constants.ts";

const modelValue = defineModel({
  type: String,
  default: ''
})
const props = defineProps({
  // 用于纯展示
  value: {
    type: String,
    default: ''
  },
  // 文件夹
  folder: {
    type: String,
    default: "temp"
  },
  // 是否可编辑
  editable: {
    type: Boolean,
    default: false
  },
  size: {
    type: Number,
    default: 32
  },
  shape: {
    type: String as PropType<"circle" | "square">,
    default: "circle"
  }
});
const url = computed(() => {
  const v = props.value || modelValue.value;
  return /https?/.test(v) ? v : convertFileSrc(v);
});
const fileInput = ref<HTMLInputElement | null>(null);

async function uploadAttachment(file: File) {
  const fileName = `${useSnowflake().nextId()}.${file.name.split('.').pop()}`;
  const f = await join(await APP_DATA_ASSET_DIR(), props.folder);
  if (!await exists(f)) {
    await mkdir(f,{
      baseDir: BaseDirectory.AppData,
      recursive: true
    });
  }
  const attachmentPath = await join(f, fileName);
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  await writeFile(attachmentPath, uint8Array);
  return attachmentPath;
}

function triggerUpload() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    modelValue.value = await uploadAttachment(file);
  }
}
</script>
<style scoped lang="less">
.xh-avatar {
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;

  &.circle {
    border-radius: 50%;
  }

  &.square {
    border-radius: 8px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    color: #999;
    width: 60%;
    height: 60%;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    cursor: pointer;
    color: white;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  &:hover .overlay {
    opacity: 1;
  }
}
</style>
