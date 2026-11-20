<template>
  <span class="inline-flex flex-wrap items-center gap-1">
    <span
      :class="[
        'rounded-md px-2 py-0.5 text-xs font-bold',
        size === '4-5' ? 'bg-forest-900 text-white' : 'bg-stone-200 text-stone-700',
      ]"
    >
      {{ size === '4-5' ? '4-5인분' : '2-3인분' }}
    </span>
    <span v-if="ownBowl" class="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-800">개인 그릇</span>
  </span>
</template>

<script setup lang="ts">
import type { Size } from '~/utils/thistle'

defineProps<{ size: Size; ownBowl: boolean }>()
</script>
