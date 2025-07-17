<template>
  <div>엉겅퀴 배달 관리 시스템 - dev</div>
  <!-- <p-button label="버튼" @click="test()"></p-button> -->
</template>

<script setup lang="ts">
const { setToastState } = useToastState();

const test = () => {
  setToastState("success", "환영합니다");
};
</script>
