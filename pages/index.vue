<template>
  <div>엉겅퀴 배달 관리 시스템</div>
  <div>마지막 푸쉬 테스트..</div>
  <!-- <p-button label="버튼" @click="test()"></p-button> -->
</template>

<script setup lang="ts">
const { setToastState } = useToastState();

const test = () => {
  setToastState("success", "환영합니다");
};
</script>
