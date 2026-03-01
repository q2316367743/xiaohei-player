<template>
  <t-card size="small">
    <sub-title title="基本设定"/>
    <t-card>
      <t-list size="small" split>
        <t-list-item>
          主题
          <template #action>
            <t-radio-group v-model="colorMode">
              <t-radio label="自动" value="auto"></t-radio>
              <t-radio label="浅色" value="light"></t-radio>
              <t-radio label="深色" value="dark"></t-radio>
            </t-radio-group>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
    <sub-title title="短片播放器" />
    <t-card>
      <t-list size="small" split>
        <t-list-item>
          显示预览轴
          <template #action>
            <t-switch :value="data.showPreviewAxis" @change="onChange('showPreviewAxis', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          视频一定从头开始播放
          <template #action>
            <t-switch :value="data.videoFromStart" @change="onChange('videoFromStart', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          启用短片播放历史记录
          <template #action>
            <t-switch :value="data.enableShortVideoHistory" @change="onChange('enableShortVideoHistory', $event)"/>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
  </t-card>
</template>
<script lang="ts" setup>
import SubTitle from "@/components/PageTitle/SubTitle.vue";
import {colorMode} from "@/global/Constants.ts";
import {useInterfaceSettingStore} from "@/store";
import type {InterfaceSetting} from "@/entity/setting/InterfaceSetting.ts";

const data = computed(() => useInterfaceSettingStore().interfaceSetting);

function onChange<K extends keyof InterfaceSetting>(key: K, value: any) {
  useInterfaceSettingStore().setItem(key, value);
}
</script>
<style scoped lang="less">

</style>
