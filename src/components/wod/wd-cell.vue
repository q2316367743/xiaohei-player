<template>
  <component 
    :is="isLink ? 'a' : 'div'"
    class="wd-cell"
    :class="{
      'wd-cell--clickable': clickable || isLink,
      'wd-cell--center': center,
      'wd-cell--large': size === 'large',
      'wd-cell--border': showBorder,
      'wd-cell--required': required
    }"
    :href="isLink ? to : undefined"
    @click="handleClick"
  >
    <div class="wd-cell__left" :style="{ width: titleWidth }">
      <div v-if="icon" class="wd-cell__icon">
        <slot name="icon">
          <span>{{ icon }}</span>
        </slot>
      </div>
      <div class="wd-cell__title-wrapper">
        <div v-if="title" class="wd-cell__title" :class="{ 'wd-cell__title--ellipsis': ellipsis }">
          {{ title }}
        </div>
        <div v-if="label" class="wd-cell__label">{{ label }}</div>
      </div>
    </div>
    <div class="wd-cell__right">
      <div v-if="value" class="wd-cell__value" :class="{ 'wd-cell__value--ellipsis': ellipsis }">
        {{ value }}
      </div>
      <slot></slot>
      <div v-if="isLink" class="wd-cell__arrow" :class="`wd-cell__arrow--${arrowDirection}`">
        <svg viewBox="0 0 1024 1024" width="16" height="16">
          <path d="M340.864 149.312a30.592 30.592 0 0 0 0 42.752L652.736 512 340.864 831.872a30.592 30.592 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z" fill="currentColor"/>
        </svg>
      </div>
    </div>
  </component>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  value: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  isLink: {
    type: Boolean,
    default: false
  },
  to: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: false
  },
  replace: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: ''
  },
  titleWidth: {
    type: String,
    default: ''
  },
  center: {
    type: Boolean,
    default: false
  },
  arrowDirection: {
    type: String,
    default: 'right'
  },
  ellipsis: {
    type: Boolean,
    default: false
  },
  border: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const router = useRouter()
const groupBorder = inject('groupBorder', false)

const showBorder = computed(() => {
  return props.border !== undefined ? props.border : groupBorder
})

const handleClick = (e: Event) => {
  if (props.to) {
    if (props.replace) {
      router.replace(props.to)
    } else {
      router.push(props.to)
    }
  }
  emit('click', e)
}
</script>

<style scoped lang="less">
.wd-cell {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px;
  background-color: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-border-level-1-color);
  transition: all 0.3s ease;
  text-decoration: none;
  color: var(--td-text-color-primary);

  &:last-child {
    border-bottom: none;
  }

  &--clickable {
    cursor: pointer;

    &:hover {
      background-color: var(--td-bg-color-container-hover);
    }

    &:active {
      background-color: var(--td-bg-color-container-active);
    }
  }

  &--center {
    align-items: center;
  }

  &--large {
    padding: 8px;
  }

  &--border {
    border-bottom: 1px solid var(--td-border-level-1-color);
  }

  &--required {
    .wd-cell__title::before {
      content: '*';
      color: var(--td-error-color-6);
      margin-right: 4px;
    }
  }

  &__left {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: var(--td-comp-size-s);
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--td-font-size-body-large);
    color: var(--td-text-color-secondary);
  }

  &__title-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__title {
    font: var(--td-font-body-medium);
    color: var(--td-text-color-primary);
    font-weight: 500;

    &--ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }
  }

  &__label {
    font: var(--td-font-body-small);
    color: var(--td-text-color-placeholder);
    margin-top: 2px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: var(--td-comp-size-s);
    flex: 1;
    justify-content: flex-end;
  }

  &__value {
    font: var(--td-font-body-medium);
    color: var(--td-text-color-secondary);

    &--ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }
  }

  &__arrow {
    display: flex;
    align-items: center;
    color: var(--td-text-color-placeholder);
    transition: transform 0.3s ease;
    flex-shrink: 0;

    &--left {
      transform: rotate(180deg);
    }

    &--up {
      transform: rotate(-90deg);
    }

    &--down {
      transform: rotate(90deg);
    }

    svg {
      display: block;
    }
  }
}
</style>
