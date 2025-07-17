<template>
  <div class="flex flex-col items-center gap-4">
    <div class="rounded-full w-24 h-24 overflow-hidden border-gray-300 border">
      <img src="/public/img/logo.jpeg" alt="logo" class="scale-150" />
    </div>
    <div class="font-semibold text-lg">THISTLE ADMIN</div>
    <div class="flex flex-col items-center gap-2">
      <p-input-text
        v-model="userId"
        placeholder="아이디"
        class="!w-60"
        size="small"
        :class="{ 'border border-red-500': errorMessages }"
      />
      <p-input-text
        v-model="userPassword"
        placeholder="비밀번호"
        class="!w-60"
        size="small"
        :class="{ 'border border-red-500': errorMessages }"
      />
      <p v-if="errorMessages" class="text-red-500 text-xs self-start">
        {{ errorMessages }}
      </p>
      <p-button label="로그인" class="!w-full" size="small" @click="handleLogin" />
      <div class="flex items-center gap-2 self-start">
        <p-checkbox
          v-model="rememberId"
          :binary="true"
          inputId="remember-id"
          label="아이디 저장"
          size="small"
        />
        <label class="text-sm" for="remember-id">아이디 저장</label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: "login",
  });

  const userId = ref<string>("");
  const userPassword = ref<string>("");

  const errorMessages = ref<string | null>(null);

  const rememberId = ref<boolean>(false);

  const handleLogin = () => {
    if (rememberId.value) {
      localStorage.setItem("savedUserId", userId.value);
    } else {
      localStorage.removeItem("savedUserId");
    }

    const mock = ref<boolean>(false); // 삭제 예정

    // 로그인 로직
    if (mock.value) {
      // 로그인 성공 로직
      errorMessages.value = null;
      // 예: 페이지 이동, 토큰 저장 등
    } else {
      // 로그인 실패 로직
      errorMessages.value = "아이디 또는 비밀번호가 일치하지 않습니다.";
      if (!rememberId.value) userId.value = "";
      userPassword.value = "";
    }
  };

  onMounted(() => {
    const savedId = localStorage.getItem("savedUserId");
    if (savedId) {
      userId.value = savedId;
      rememberId.value = true;
    }
  });
</script>
