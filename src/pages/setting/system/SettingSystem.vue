<template>
  <t-card size="small" class="setting-card">
    <sub-title title="路径">
      <template #action>
        <t-typography-text theme="error" class="pt-3px">非必要请勿修改</t-typography-text>
      </template>
    </sub-title>
    <t-card>
      <t-list size="small" split>
        <t-list-item>
          <t-list-item-meta title="是否启用代理">
          </t-list-item-meta>
          <template #action>
            <t-switch v-model="data.proxy_enabled" @change="onChange('proxy_enabled', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="代理协议">
          </t-list-item-meta>
          <template #action>
            <t-radio-group v-model="data.proxy_protocol" @change="onChange('proxy_protocol', $event)">
              <t-radio value="http">http</t-radio>
              <t-radio value="https">https</t-radio>
              <t-radio value="socks5">socks5</t-radio>
            </t-radio-group>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="代理主机">
          </t-list-item-meta>
          <template #action>
            <t-input v-model="data.proxy_host" @change="onChange('proxy_host', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="代理主机端口">
          </t-list-item-meta>
          <template #action>
            <t-input-number v-model="data.proxy_port" @change="onChange('proxy_port', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="代理用户名">
          </t-list-item-meta>
          <template #action>
            <t-input v-model="data.proxy_username" @change="onChange('proxy_username', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="代理密码">
          </t-list-item-meta>
          <template #action>
            <t-input type="password" v-model="data.proxy_password" @change="onChange('proxy_password', $event)"/>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
    <sub-title title="转码"/>
    <t-card>
      <t-list size="small" split>
        <t-list-item>
          <t-list-item-meta title="转码生成的串流的最大清晰度" description="转码生成的串流最大值"/>
          <template #action>
            <t-select v-model="data.transcoderMaxResolution" @change="onChange('transcoderMaxResolution', $event)">
              <t-option value="240p">240p</t-option>
              <t-option value="480p">480p</t-option>
              <t-option value="720p">720p</t-option>
              <t-option value="1080p">1080p</t-option>
              <t-option value="4k">4k</t-option>
              <t-option value="original">原始</t-option>
            </t-select>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="FFmpeg 硬件编码" description="使用可用的硬件对视频进行编码来用于实时转码。"/>
          <template #action>
            <t-switch v-model="data.transcoderHardwareEncoding"
                      @change="onChange('transcoderHardwareEncoding', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="扫描/生成的并行任务数量"
                            description="设置为 0 以进行自动检测。警告，当运行超过需要的多个任务使得 cpu 达到满负荷时，将降低性能并可能导致其他问题。"/>
          <template #action>
            <t-input-number v-model="data.transcoderParallelTasks" :min="0"
                            @change="onChange('transcoderParallelTasks', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="调整预设值"
                            description="预设是用来调节预览生成的大小、质量和编码时间。slow 以下的选项不推荐使用。"/>
          <template #action>
            <t-select v-model="data.transcoderPreset" @change="onChange('transcoderPreset', $event)">
              <t-option value="ultrafast">ultrafast</t-option>
              <t-option value="veryfast">veryfast</t-option>
              <t-option value="fast">fast</t-option>
              <t-option value="medium">medium</t-option>
              <t-option value="slow">slow</t-option>
              <t-option value="slower">slower</t-option>
              <t-option value="veryslow">veryslow</t-option>
            </t-select>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="包括声音" description="生成预览时包括音频流。"/>
          <template #action>
            <t-switch v-model="data.transcoderIncludeAudio" @change="onChange('transcoderIncludeAudio', $event)"/>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
    <sub-title title="预览生成"/>
    <t-card>
      <t-list size="small" split>
        <t-list-item>
          <t-list-item-meta title="预览片段段数" description="设置预览片段中的段数。"/>
          <template #action>
            <t-input-number v-model="data.preview.segments" :min="1" @change="onChangePreview('segments', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="预览片段长度" description="每个预览片段的长度，以秒为单位。"/>
          <template #action>
            <t-input-number v-model="data.preview.segmentDuration" :min="0.1" :step="0.1"
                            @change="onChangePreview('segmentDuration', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="排除开始时间"
                            description="从短片预览中排除最开始 x 秒。"/>
          <template #action>
            <t-input-number v-model="data.preview.excludeStart" :min="0"
                            @change="onChangePreview('excludeStart', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="排除结束时间"
                            description="从短片预览中排除最后 x 秒。"/>
          <template #action>
            <t-input-number v-model="data.preview.excludeEnd" :min="0" @change="onChangePreview('excludeEnd', $event)"/>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
    <sub-title title="日志"/>
    <t-card>
      <t-list size="small" split>
        <t-list-item>
          <t-list-item-meta title="日志文件">
            <template #description>
              日志文件的路径，如果为空则表示关闭日志记录。更改之后需要重启。
              <br/>
              <t-link theme="primary">{{ data.logFile || '未设置' }}</t-link>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onPathEdit('logFile')">编辑</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="输出日志到终端"
                            description="日志除了输出到文件外还输出到终端，如果关闭日志记录则始终开启。更改之后需要重启。"/>
          <template #action>
            <t-switch v-model="data.logToTerminal" @change="onChange('logToTerminal', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="日志等级"/>
          <template #action>
            <t-select v-model="data.logLevel" @change="onChange('logLevel', $event)">
              <t-option value="trace">trace</t-option>
              <t-option value="debug">debug</t-option>
              <t-option value="info">info</t-option>
              <t-option value="warn">warn</t-option>
              <t-option value="error">error</t-option>
            </t-select>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="记录 HTTP 访问日志" description="输出 HTTP 访问日志到终端，更改之后需要重启。"/>
          <template #action>
            <t-switch v-model="data.logHTTP" @change="onChange('logHTTP', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="最大日志尺寸"
                            description="日志文件压缩前的最大大小（以兆字节为单位）。0MB 表示禁用此功能。需要重启。"/>
          <template #action>
            <t-input-number v-model="data.maxLogSize" :min="0" @change="onChange('maxLogSize', $event)"/>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
  </t-card>
</template>
<script lang="ts" setup>
import SubTitle from "@/components/PageTitle/SubTitle.vue";
import {type SystemSetting, SystemSettingTitle} from "@/entity/setting/SystemSetting.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {logDebug} from "@/lib/log.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {useSettingStore} from "@/store";
import {storeToRefs} from "pinia";

const {systemSetting: data} = storeToRefs(useSettingStore());


function onChange<K extends keyof SystemSetting>(key: K, value: any) {
  useSettingStore()
    .setSystemItem(key, value)
    .then(() => logDebug("保存成功"))
    .catch(e => MessageUtil.error("保存失败", e));
}

function onChangePreview<K extends keyof SystemSetting['preview']>(key: K, value: any) {
  data.value.preview[key] = value;
  useSettingStore()
    .setSystemItem('preview', data.value.preview)
    .then(() => logDebug("保存成功"))
    .catch(e => MessageUtil.error("保存失败", e));
}

const onPathEdit = (key: keyof SystemSetting) => {
  MessageBoxUtil.prompt("请输入路径", SystemSettingTitle[key], {
    inputValue: data.value[key] as string
  }).then((res) => {
    onChange(key, res);
    data.value[key] = res as never;
  })
}

</script>
<style scoped lang="less">

</style>
