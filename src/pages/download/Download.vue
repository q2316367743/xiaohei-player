<template>
  <app-tool-layout title="视频下载">
    <div class="p-8px">
      <t-card>
        <t-form-item label="视频链接" label-align="top">
          <t-textarea v-model="url" placeholder="请输入视频链接" :autosize="{minRows: 3, maxRows: 5}"></t-textarea>
        </t-form-item>
        <t-form-item label="平台" label-align="top">
          <t-select v-model="platform" :options="DownloadPluginPlatformOptions" placeholder="请选择平台"/>
        </t-form-item>
        <t-form-item label="插件" label-align="top">
          <t-select v-model="plugin" :options="options" placeholder="请选择插件"/>
        </t-form-item>
        <t-form-item label-align="top">
          <t-space>
            <t-button theme="primary" :disabled="!canParse" :loading="loading" @click="handleParse">解析</t-button>
            <t-button theme="danger" :loading="loading" @click="handleReset">重置</t-button>
          </t-space>
        </t-form-item>
      </t-card>

      <t-card v-if="result" class="mt-16px">
        <div class="result-content">
          <div class="result-cover">
            <t-image
              v-if="result.cover"
              :src="result.cover"
              fit="cover"
              class="cover-image"
            />
            <div v-else class="cover-placeholder">
              <t-icon name="video" size="60px"/>
            </div>
          </div>
          <div class="result-info">
            <div class="result-title">{{ result.title }}</div>
            <div v-if="result.author" class="result-author">
              <t-icon name="user" size="16px"/>
              <span>{{ result.author }}</span>
            </div>
            <div v-if="result.description" class="result-description">{{ result.description }}</div>
            <div class="result-actions">
              <t-space>
                <t-button theme="primary" @click="handleDownload">
                  <template #icon>
                    <t-icon name="download"/>
                  </template>
                  下载视频
                </t-button>
                <t-button variant="outline" @click="handleCopyUrl">
                  <template #icon>
                    <t-icon name="link"/>
                  </template>
                  复制链接
                </t-button>
              </t-space>
            </div>
          </div>
        </div>
      </t-card>
    </div>
  </app-tool-layout>
</template>
<script lang="ts" setup>
import {
  type DownloadPluginPlatform,
  DownloadPluginPlatformOptions, type DownloadPluginView
} from "@/entity/main/DownloadPlugin.ts";
import {listDownloadPlugin} from "@/service/DownloadPluginService.ts";
import {type DownloadResult, parseDownloadUrl} from "@/module/download";
import MessageUtil from "@/util/model/MessageUtil.ts";

const url = ref('');
const platform = ref<DownloadPluginPlatform>('douyin');
const plugin = ref('');
const result = ref<DownloadResult>();
const loading = ref(false);

const plugins = ref(new Array<DownloadPluginView>());

const options = computed(() => plugins.value.filter(e => e.platform.includes(platform.value)).map(e => ({
  label: e.name,
  value: e.id
})))
const canParse = computed(() => !!url.value && !!plugin.value && !!platform.value);

const initList = async () => {
  plugins.value = await listDownloadPlugin();
};

const handleReset = () => {
  url.value = '';
  platform.value = 'douyin';
  plugin.value = '';
  result.value = undefined;
}

const parse = async () => {
  const p = plugins.value.find(e => e.id === plugin.value);
  if (!p) return Promise.reject(new Error('插件不存在'));
  result.value = undefined;
  result.value = await parseDownloadUrl(p, url.value);
}
const handleParse = () => {
  if (loading.value) return MessageUtil.warning('解析中，请稍候');
  loading.value = true;
  parse().then(() => {
    MessageUtil.success('解析成功');
  }).catch(e => {
    MessageUtil.error('解析失败', e);
  }).finally(() => {
    loading.value = false;
  })
}

const handleDownload = () => {
  if (!result.value) return;
  const link = document.createElement('a');
  link.href = result.value.url;
  link.download = result.value.title || 'video.mp4';
  link.target = '_blank';
  link.click();
  MessageUtil.success('开始下载');
}

const handleCopyUrl = async () => {
  if (!result.value) return;
  try {
    await navigator.clipboard.writeText(result.value.url);
    MessageUtil.success('链接已复制到剪贴板');
  } catch (e) {
    MessageUtil.error('复制失败', e);
  }
}

onMounted(initList);
</script>
<style scoped lang="less">
.mt-16px {
  margin-top: 16px;
}

.result-content {
  display: flex;
  gap: 20px;
  padding: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.result-cover {
  flex-shrink: 0;
  width: 240px;
  height: 135px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--td-bg-color-container-hover);

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--td-text-color-placeholder);
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.result-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.result-author {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.result-description {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.result-actions {
  margin-top: auto;
  padding-top: 12px;
}
</style>
