<template>
  <div>
    <h2>小黑影音</h2>
    <t-input v-model="from"></t-input>
    <t-input v-model="to" readonly></t-input>
    <t-button @click="handle">获取</t-button>
    <video :src="to" controls width="500px" height="300px"></video>
  </div>
</template>
<script lang="ts" setup>
import {convertFileSrc} from "@tauri-apps/api/core";

const from = ref('');
const to = ref('');

const handle = () => {
  to.value = convertFileSrc(from.value);
}
</script>
<style scoped lang="less">

</style>
