<template>
  <span v-if="value === null || value === undefined" class="rounded-md bg-stone-200 px-2 py-0.5 text-xs font-bold text-stone-600">미입력</span>
  <span v-else class="inline-flex items-center gap-1.5">
    <b :class="['text-base', value === 1 ? 'text-red-700' : value <= 0 ? 'text-stone-400' : 'text-stone-900']">{{ prefix }}{{ value }}회</b>
    <span v-if="value === 1" class="rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-bold text-red-700">마지막</span>
    <span v-else-if="value <= 0" class="rounded-md bg-stone-200 px-1.5 py-0.5 text-xs font-bold text-stone-600">횟수 끝남</span>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ value: number | null; prefix?: string }>(), { prefix: '' })
</script>
