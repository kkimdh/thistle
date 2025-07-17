<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- 토스트 메세지 -->
  <pp-toast
    position="top-center"
    :pt="{
      message: {
        class: 'w-[80%] !mx-auto md:w-full',
      },
      messageicon: {
        class: '!mt-[3px]',
      },
      detail: {
        class: '[&:empty]:hidden', // 텍스트가 없을 경우 숨김(공백 방지)
      },
    }"
  />
</template>

<script setup lang="ts">
  import { useToast } from "primevue/usetoast";

  import { useToastState } from "~/composables/useToastState";

  const toast = useToast();
  const { toastState, clearToastState } = useToastState();

  watch(
    toastState,
    (newState) => {
      if (newState) {
        toast.add(newState);
        clearToastState();
      }
    },
    { immediate: true },
  );
</script>
