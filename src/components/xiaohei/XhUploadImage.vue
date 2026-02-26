<template>
  <div class="xh-upload-image">
    <div class="image-list">
      <div
        v-for="(img, idx) in images"
        :key="idx"
        class="image-item"
        :style="{ width: `${size}px`, height: `${size}px` }"
      >
        <img :src="img" :alt="`image-${idx}`"/>
        <div class="delete-btn" @click="removeImage(idx)">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </div>
      </div>
      <div
        v-if="images.length < maxCount"
        class="upload-btn"
        :style="{ width: `${size}px`, height: `${size}px` }"
        @click="triggerUpload"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        <span>上传图片</span>
      </div>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      @change="handleFileChange"
      style="display: none"
    />
  </div>
</template>

<script lang="ts" setup>
import {convertFileSrc} from "@tauri-apps/api/core";
import {BaseDirectory, join} from "@tauri-apps/api/path";
import {exists, mkdir, writeFile} from "@tauri-apps/plugin-fs";
import {useSnowflake} from "@/util";
import {APP_DATA_ASSET_DIR} from "@/global/Constants.ts";

const modelValue = defineModel<string[]>({
  type: Array,
  default: () => []
})

const props = defineProps({
  folder: {
    type: String,
    default: "temp"
  },
  size: {
    type: Number,
    default: 80
  },
  maxCount: {
    type: Number,
    default: 9
  }
});

const images = computed(() => {
  return modelValue.value.map(url => /https?/.test(url) ? url : convertFileSrc(url));
});

const fileInput = ref<HTMLInputElement | null>(null);

async function uploadAttachment(file: File) {
  const fileName = `${useSnowflake().nextId()}.${file.name.split('.').pop()}`;
  const f = await join(await APP_DATA_ASSET_DIR(), props.folder);
  if (!await exists(f)) {
    await mkdir(f, {
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
  const files = target.files;
  if (files) {
    const remainingSlots = props.maxCount - modelValue.value.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    for (const file of filesToUpload) {
      const path = await uploadAttachment(file);
      modelValue.value.push(path);
    }
  }
  target.value = '';
}

function removeImage(idx: number) {
  modelValue.value.splice(idx, 1);
}
</script>

<style scoped lang="less">
@import "@/assets/style/monica.less";

.xh-upload-image {
  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--monica-spacing-sm);
  }

  .image-item {
    position: relative;
    border-radius: var(--monica-radius-md);
    overflow: hidden;
    background: var(--monica-warm-bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px var(--monica-shadow);
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 4px 16px var(--monica-shadow-strong);
      transform: translateY(-2px);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .delete-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 20px;
      height: 20px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

      svg {
        width: 14px;
        height: 14px;
      }

      &:hover {
        background: var(--monica-coral);
        transform: scale(1.1);
      }
    }
  }

  .upload-btn {
    border: 1px solid var(--monica-border);
    border-radius: var(--monica-radius-md);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--monica-text-tertiary);
    background: var(--monica-warm-bg-secondary);
    box-shadow: 0 2px 8px var(--monica-shadow);

    svg {
      width: 24px;
      height: 24px;
      margin-bottom: 4px;
      color: var(--monica-text-tertiary);
      transition: color 0.2s ease;
    }

    span {
      font-size: var(--monica-font-sm);
      color: var(--monica-text-tertiary);
      transition: color 0.2s ease;
    }

    &:hover {
      border-color: var(--monica-coral);
      color: var(--monica-coral);
      background: var(--monica-peach-light);
      box-shadow: 0 4px 12px var(--monica-shadow-strong);
      transform: translateY(-1px);

      svg, span {
        color: var(--monica-coral);
      }
    }

    &:active {
      transform: translateY(0);
    }
  }
}
</style>
