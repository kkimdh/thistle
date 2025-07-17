<template>
  <div></div>
  <p-button label="버튼" @click="test()"></p-button>
</template>

<script setup lang="ts">
  const { setToastState } = useToastState();

  const test = () => {
    setToastState("success", "환영합니다");
  };
</script>
