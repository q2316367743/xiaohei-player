<template>
  <div>链接播放器</div>
</template>
<script lang="ts" setup>
const route = useRoute();

const type = route.query.type as string;
const src = route.query.src as string;
</script>
<style scoped lang="less">

</style>
