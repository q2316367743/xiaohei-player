<template>
  <t-card size="small">
    <sub-title title="可执行文件"/>
    <t-card>
      <t-list size="small" split>
        <t-list-item>
          <t-list-item-meta title="FFmpeg可执行路径">
            <template #description>
              ffmpeg可执行文件（不仅仅是文件夹）的路径。如果为空，ffmpeg将通过$PATH、配置目录或$HOME/.stash从环境中解析
              <br/>
              <t-link theme="primary">{{ data.ffmpegPath || '未设置' }}</t-link>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onPathEditExecutable('ffmpegPath')">编辑</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="FFprobe 可执行路径">
            <template #description>
              ffprobe可执行文件的路径（不仅仅是文件夹）。如果为空，ffprobe将通过$PATH、配置目录或$HOME/.stash从环境中解析
              <br/>
              <t-link theme="primary">{{ data.ffprobePath || '未设置' }}</t-link>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onPathEditExecutable('ffprobePath')">编辑</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="Python 可执行文件路径">
            <template #description>
              Python 执行程序的路径。（不限于文件夹）给网页挖掘器和插件的源文件使用。如果没有，python会从环境变量找到
              <br/>
              <t-link theme="primary">{{ data.pythonPath || '未设置' }}</t-link>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onPathEditExecutable('pythonPath')">编辑</t-button>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
    <sub-title title="路径">
      <template #action>
        <t-typography-text theme="error" class="pt-3px">非必要请勿修改</t-typography-text>
      </template>
    </sub-title>
    <t-card>
      <t-list size="small" split>
        <t-list-item>
          <t-list-item-meta title="生成数据的存储路径">
            <template #description>
              生成数据的存储目录（短片标记，短片预览，预览图等）
              <br/>
              <t-link theme="primary">{{ data.dataPath || '未设置' }}</t-link>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onPathEdit('dataPath')">编辑</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="缓存路径">
            <template #description>
              缓存的目录位置。如果使用 HLS（例如在 Apple 设备上）或 DASH 进行流传输，则需要该位置。
              <br/>
              <t-link theme="primary">{{ data.cachePath || '未设置' }}</t-link>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onPathEdit('cachePath')">编辑</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="刮削器路径">
            <template #description>
              含有刮削器配置文件的路径
              <br/>
              <t-link theme="primary">{{ data.scraperPath || '未设置' }}</t-link>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onPathEdit('scraperPath')">编辑</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="插件文件路径">
            <template #description>
              插件配置文件目录
              <br/>
              <t-link theme="primary">{{ data.pluginPath || '未设置' }}</t-link>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onPathEdit('pluginPath')">编辑</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="元数据存储路径">
            <template #description>
              整体导出或者导入时使用的路径
              <br/>
              <t-link theme="primary">{{ data.metaPath || '未设置' }}</t-link>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onPathEdit('metaPath')">编辑</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="自定义演员图像路径">
            <template #description>
              默认演员图像的自定义路径。留空以使用内置默认值
              <br/>
              <t-link theme="primary">{{ data.customActorImagePath || '未设置' }}</t-link>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onPathEdit('customActorImagePath')">编辑</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="备份用的路径">
            <template #description>
              备份SQLite 数据库文件的目录路径
              <br/>
              <t-link theme="primary">{{ data.backupPath || '未设置' }}</t-link>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onPathEdit('backupPath')">编辑</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="回收站路径">
            <template #description>
              删除的文件将被移动到的路径，而不是永久删除。留空将永久删除文件。
              <br/>
              <t-link theme="primary">{{ data.trashPath || '未设置' }}</t-link>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="primary" @click="onPathEdit('trashPath')">编辑</t-button>
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
import {getSystemSetting, type SystemSetting, SystemSettingTitle} from "@/entity/setting/SystemSetting.ts";
import {useSystemSettingStore} from "@/lib/store.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {logDebug} from "@/lib/log.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {platform} from "@tauri-apps/plugin-os";
import {Command} from "@tauri-apps/plugin-shell";

const data = ref<SystemSetting>(getSystemSetting());

onMounted(() => {
  useSystemSettingStore().get()
    .then((res) => {
      data.value = res;
    })
    .catch(e => MessageUtil.error("获取数据失败", e))
});

function onChange<K extends keyof SystemSetting>(key: K, value: any) {
  useSystemSettingStore()
    .setItem(key, value)
    .then(() => logDebug("保存成功"))
    .catch(e => MessageUtil.error("保存失败", e));
}

function onChangePreview<K extends keyof SystemSetting['preview']>(key: K, value: any) {
  data.value.preview[key] = value;
  useSystemSettingStore()
    .setItem('preview', data.value.preview)
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

// 可执行
const onPathEditExecutable = (key: 'ffmpegPath' | 'ffprobePath' | 'pythonPath') => {
  MessageBoxUtil.executablePathPrompt(undefined, SystemSettingTitle[key], {
    inputValue: data.value[key] as string
  }).then((res) => {
    onChange(key, res);
    if (platform() === 'macos') {
      Command.create('xattr-d-apple', [
        "-d",
        "com.apple.quarantine",
        res
      ]).execute()
        .then(r => logDebug("移除隔离属性成功", r))
        .catch(e => MessageUtil.error("移除隔离属性失败", e));
    }
    data.value[key] = res as never;
  })
}
</script>
<style scoped lang="less">

</style>
