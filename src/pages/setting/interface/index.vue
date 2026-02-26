<template>
  <t-card>
    <sub-title title="基本设定" />
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
  </t-card>
</template>
<script lang="ts" setup>
import SubTitle from "@/components/PageTitle/SubTitle.vue";
import {colorMode} from "@/global/Constants.ts";
</script>
<style scoped lang="less">

</style>
