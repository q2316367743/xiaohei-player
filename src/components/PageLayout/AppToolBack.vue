<template>
  <t-button :theme :variant :size shape="square"
            @click="goBack()">
    <template #icon>
      <home-icon v-if="home"/>
      <chevron-left-icon v-else/>
    </template>
  </t-button>
</template>
<script lang="ts" setup>
import {ChevronLeftIcon, HomeIcon} from "tdesign-icons-vue-next";
import {type TdButtonProps} from "tdesign-vue-next";

const props = defineProps({
  theme: {
    type: String as PropType<TdButtonProps["theme"]>,
    default: "primary"
  },
  variant: {
    type: String as PropType<TdButtonProps["variant"]>,
    default: "text"
  },
  size: {
    type: String as PropType<TdButtonProps["size"]>,
    default: "medium"
  },
  home: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();
const goBack = () => {
  if (props.home) {
    router.push('/home');
    return;
  }
  router.back();
}
</script>
<style scoped lang="less">

</style>
