<template>
  <app-tool-layout title="视频下载" :show-sidebar="sidebarVisible" :sidebar-width="360">
    <template #action>
      <t-button variant="text" @click="toggleSidebar">
        <template #icon>
          <t-icon name="download-1"/>
        </template>
        下载列表
      </t-button>
    </template>
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
    <template #sidebar>
      <DownloadList/>
    </template>
  </app-tool-layout>
</template>
<script lang="ts" setup>
import {
  type DownloadPluginPlatform,
  DownloadPluginPlatformOptions, type DownloadPluginView
} from "@/entity/main/DownloadPlugin.ts";
import {listDownloadPlugin} from "@/service/DownloadPluginService.ts";
import {type DownloadResult, pluginParse} from "@/module/download";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {useDownloadStore} from "@/store";
import {storeToRefs} from "pinia";
import DownloadList from "@/pages/download/components/DownloadList.vue";

const url = ref('');
const platform = ref<DownloadPluginPlatform>('douyin');
const plugin = ref('');
const result = ref<DownloadResult>();
const loading = ref(false);

const plugins = ref(new Array<DownloadPluginView>());
const downloadStore = useDownloadStore();
const {sidebarVisible} = storeToRefs(downloadStore);

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
  result.value = undefined;
}

const parse = async () => {
  const p = plugins.value.find(e => e.id === plugin.value);
  if (!p) return Promise.reject(new Error('插件不存在'));
  result.value = undefined;
  result.value = await pluginParse(p, url.value, platform.value);
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
  downloadStore.startDownload(result.value);
  url.value = '';
  result.value = undefined;
}

const handleCopyUrl = async () => {
  if (!result.value) return;
  try {
    await navigator.clipboard.writeText(result.value.video);
    MessageUtil.success('链接已复制到剪贴板');
  } catch (e) {
    MessageUtil.error('复制失败', e);
  }
}

const toggleSidebar = () => {
  downloadStore.toggleSidebar();
}

onMounted(initList);
</script>
<style scoped lang="less">
@import "less/download.less";
</style>
