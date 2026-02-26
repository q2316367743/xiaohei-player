<template>
  <t-card size="small">
    <sub-title title="任务队列"/>
    <t-card>
      目前没有任务在运行
    </t-card>
    <sub-title title="收藏库"/>
    <t-card>
      <div class="flex justify-between">
        <div>
          <div class="font-size-1.2rem font-bold">扫描</div>
          <div>扫描新内容并添加到数据库中</div>
        </div>
        <div class="flex gap-8px">
          <t-button>扫描</t-button>
          <t-button>选择性扫描</t-button>
        </div>
      </div>
      <t-list size="small" split>
        <t-list-item>
          生成短片封面
          <template #action>
            <t-switch v-model="data.generateShortCover" @change="onChange('generateShortCover', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          生成预览
          <template #action>
            <t-switch v-model="data.generatePreview" @change="onChange('generatePreview', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          生成时间轴预览小图
          <template #action>
            <t-switch v-model="data.generateTimelinePreviewThumbnail"
                      @change="onChange('generateTimelinePreviewThumbnail', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          生成图片的缩略图
          <template #action>
            <t-switch v-model="data.generateImageThumbnail" @change="onChange('generateImageThumbnail', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          为图像短片生成预览图
          <template #action>
            <t-switch v-model="data.generateShortCoverPreview" @change="onChange('generateShortCoverPreview', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          重新扫描文件
          <template #action>
            <t-switch v-model="data.reScanFile" @change="onChange('reScanFile', $event)"/>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
    <sub-title title="生成的内容"/>
    <t-card>
      <div class="flex justify-between">
        <div>
          <div class="font-size-1.2rem font-bold">生成</div>
          <div>生成辅助的图片，预览，片段，字幕等其他文件。</div>
        </div>
        <div class="flex gap-8px">
          <t-button>生成</t-button>
        </div>
      </div>
      <t-list size="small" split>
        <t-list-item>
          短片封面
          <template #action>
            <t-switch v-model="data.shortCover" @change="onChange('shortCover', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <div>
            预览
            <t-tooltip content="鼠标悬停在短片上时播放的预览短片">
              <help-circle-filled-icon/>
            </t-tooltip>
          </div>
          <template #action>
            <t-switch v-model="data.preview" @change="onChange('preview', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <div>
          短视频时间轴预览小图
          <t-tooltip content="视频播放器下方用于快速导航的缩略图集。">
            <help-circle-filled-icon/>
          </t-tooltip>
          </div>
          <template #action>
            <t-switch v-model="data.timelinePreviewThumbnail" @change="onChange('timelinePreviewThumbnail', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <div>
          标记预览
            <t-tooltip content="从给出的时间码开始20秒的视频.">
              <help-circle-filled-icon/>
            </t-tooltip>
          </div>
          <template #action>
            <t-switch v-model="data.markPreview" @change="onChange('markPreview', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <div>
          标记的屏幕截图
            <t-tooltip content="标记使用静态JPG 图像">
              <help-circle-filled-icon/>
            </t-tooltip>
          </div>
          <template #action>
            <t-switch v-model="data.markScreenshot" @change="onChange('markScreenshot', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          产生热图和速度资料给有互动的短片
          <template #action>
            <t-switch v-model="data.generateHeatmapAndSpeedData"
                      @change="onChange('generateHeatmapAndSpeedData', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          图像片段预览
          <template #action>
            <t-switch v-model="data.imageSegmentPreview" @change="onChange('imageSegmentPreview', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          图像缩略图
          <template #action>
            <t-switch v-model="data.imageThumbnail" @change="onChange('imageThumbnail', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          覆盖现有文件
          <template #action>
            <t-switch v-model="data.overwriteExistingFile" @change="onChange('overwriteExistingFile', $event)"/>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
    <sub-title title="维护"/>
    <t-card>
      <t-list size="small" split>
        <t-list-item>
          <t-list-item-meta title="清理" description="检查缺失的文件并将它们的数据从数据库中删除。 注意，这是一个破坏性的动作。" />
          <template #action>
            <t-button theme="danger">清理</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="清除已生成的文件" description="移除没有相应数据库条目的已生成文件。" />
          <template #action>
            <t-button theme="danger">清除已生成的文件</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="优化数据库">
            <template #description>
              <p>尝试通过分析然后重建整个数据库文件来提高性能。</p>
              <p>警告：当此任务运行时，任何修改数据库的操作都将失败，而且根据数据库的大小，可能需要几分钟才能完成。此外，它至少需要与数据库大小相当的可用磁盘空间，但建议使用 1.5 倍的空间。</p>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="danger">优化数据库</t-button>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
    <sub-title title="元数据"/>
    <sub-title title="备份"/>
    <sub-title title="迁移"/>
  </t-card>
</template>
<script lang="ts" setup>
import SubTitle from "@/components/PageTitle/SubTitle.vue";
import {getTaskSetting, type TaskSetting} from "@/entity/setting/TaskSetting.ts";
import {useTaskSettingStore} from "@/lib/store.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {logDebug} from "@/lib/log.ts";
import {HelpCircleFilledIcon} from "tdesign-icons-vue-next";

const data = ref<TaskSetting>(getTaskSetting());

onMounted(() => {
  useTaskSettingStore().get()
    .then((res) => {
      data.value = res;
    })
    .catch(e => MessageUtil.error("获取数据失败", e))
});

function onChange<K extends keyof TaskSetting>(key: K, value: any) {
  useTaskSettingStore()
    .setItem(key, value)
    .then(() => logDebug("保存成功"))
    .catch(e => MessageUtil.error("保存失败", e));
}
</script>
<style scoped lang="less">

</style>
