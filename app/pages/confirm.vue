<template>
  <div class="min-h-dvh flex items-center justify-center text-forest-700">로그인 중…</div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()

watch(
  user,
  () => {
    if (user.value) navigateTo('/')
  },
  { immediate: true },
)
</script>
