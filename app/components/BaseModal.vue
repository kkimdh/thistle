<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      @click.self="emit('close')"
    >
      <div class="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-xl sm:rounded-2xl">
        <div class="px-5 pb-3 pt-5">
          <h2 class="text-xl font-bold">{{ title }}</h2>
          <slot name="description">
            <p v-if="description" class="mt-1 whitespace-pre-line text-sm text-stone-600">{{ description }}</p>
          </slot>
        </div>
        <div class="flex flex-col gap-4 px-5 pb-4">
          <slot />
        </div>
        <div class="flex items-center gap-2 border-t border-stone-100 px-5 py-4">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ open: boolean; title: string; description?: string }>()
const emit = defineEmits<{ close: [] }>()
</script>
