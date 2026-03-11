<template>
  <sub-page-layout :title="actor?.name">
    <div class="actor-detail-page">
      <div class="actor-header">
        <div class="header-content">
          <div class="avatar-wrapper">
            <div class="avatar-frame">
              <XhAvatar
                :value="actor?.photo_path"
                :size="120"
                shape="circle"
              />
            </div>
          </div>
          <div class="actor-info">
            <h1 class="actor-name">{{ actor?.name }}</h1>
            <div class="actor-meta">
            <span v-if="actor?.original_name" class="meta-item">
              <t-icon name="user" size="16px"/>
              {{ actor.original_name }}
            </span>
              <span v-if="actor?.gender" class="meta-item">
              <t-icon name="usercircle" size="16px"/>
              {{ genderText }}
            </span>
              <span v-if="actor?.birth_date" class="meta-item">
              <t-icon name="calendar" size="16px"/>
              {{ formatDate(actor.birth_date) }}
            </span>
            </div>
            <p v-if="actor?.biography" class="actor-biography">{{ actor.biography }}</p>
          </div>
        </div>
      </div>

      <t-card class="video-section" title="视频作品">
        <template #actions>
          <t-tag theme="primary">{{ videos.length }} 个视频</t-tag>
        </template>
        <div class="video-grid" v-if="videos.length > 0">
          <VideoCard
            v-for="video in videos"
            :key="video.id"
            :video="video"
          />
        </div>
        <div v-else class="empty-state">
          <t-icon name="info-circle" size="48px"/>
          <p>暂无视频作品</p>
        </div>
      </t-card>
    </div>
  </sub-page-layout>

</template>
<script lang="ts" setup>

import type {Actor} from "@/entity/domain/Actor.ts";
import {getActor, listVideoByActorId} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";
import type {Video} from "@/entity/domain/Video.ts";
import XhAvatar from "@/components/xiaohei/XhAvatar.vue";
import VideoCard from "@/pages/library/detail/components/VideoCard.vue";

const route = useRoute();
const router = useRouter();

const actorId = route.params.id as string;

const actor = ref<Actor>();
const videos = ref<Array<Video>>([]);

const genderText = computed(() => {
  if (!actor.value?.gender) return '';
  const genderMap = {
    'male': '男',
    'female': '女',
    'other': '其他'
  };
  return genderMap[actor.value.gender];
});

onMounted(async () => {
  try {
    actor.value = await getActor(actorId);
    if (!actor.value) {
      MessageUtil.error("演员未找到");
      router.back();
      return;
    }
    videos.value = await listVideoByActorId(actorId);
  } catch (e) {
    MessageUtil.error("获取演员失败", e);
    router.back();
    return;
  }
})

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

</script>
<style scoped lang="less">
.actor-detail-page {
  min-height: calc(100vh - 72px);
  padding: 8px;
}

.actor-header {
  background: linear-gradient(180deg, var(--td-bg-color-container) 0%, var(--td-bg-color-secondarycontainer) 100%);
  border-radius: 16px;
  padding: 8px;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08),
  0 2px 4px rgba(0, 0, 0, 0.04),
  inset 0 1px 0 rgba(255, 255, 255, 0.8),
  inset 0 -1px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid var(--td-border-level-1-color);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  }
}

.header-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar-frame {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, var(--td-bg-color-container) 0%, var(--td-bg-color-secondarycontainer) 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15),
  0 2px 4px rgba(0, 0, 0, 0.1),
  inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid var(--td-border-level-1-color);
}

.actor-info {
  flex: 1;
  min-width: 0;
}

.actor-name {
  font-size: 28px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 8px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.actor-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: linear-gradient(180deg, var(--td-bg-color-container) 0%, var(--td-bg-color-secondarycontainer) 100%);
  border-radius: 20px;
  font-size: 13px;
  color: var(--td-text-color-secondary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06),
  inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid var(--td-border-level-1-color);
}

.actor-biography {
  font-size: 14px;
  line-height: 1.6;
  color: var(--td-text-color-secondary);
  margin: 0;
  padding: 8px;
  background: linear-gradient(180deg, var(--td-bg-color-container) 0%, var(--td-bg-color-secondarycontainer) 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06),
  inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid var(--td-border-level-1-color);
}

.video-section {
}

.video-count {
  padding: 4px 8px;
  background: linear-gradient(180deg, var(--td-brand-color) 0%, var(--td-brand-color-active) 100%);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15),
  inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 226px);
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 8px;
  color: var(--td-text-color-placeholder);

  p {
    margin-top: 8px;
    font-size: 14px;
  }
}
</style>
