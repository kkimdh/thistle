<template>
  <div class="min-h-dvh bg-forest-900 flex flex-col items-center justify-center gap-10 p-6">
    <div class="flex flex-col items-center gap-3">
      <img src="/logo.png" alt="엉겅퀴" class="size-24 rounded-3xl bg-white object-contain p-2" />
      <h1 class="text-3xl font-bold text-white">엉겅퀴</h1>
      <p class="text-forest-200">승인된 계정만 사용 가능</p>
    </div>
    <div class="w-full max-w-sm flex flex-col gap-3">
      <button
        type="button"
        class="h-14 rounded-xl bg-[#FEE500] text-[#191919] font-bold text-base disabled:opacity-60"
        :disabled="loading"
        @click="loginWithKakao"
      >
        {{ loading ? '카카오로 이동 중…' : '카카오로 로그인' }}
      </button>
      <p v-if="errorMsg" class="text-center text-sm text-red-200">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const loading = ref(false)
const errorMsg = ref('')

const loginWithKakao = async () => {
  loading.value = true
  errorMsg.value = ''
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/confirm`,
    },
  })
  if (error) {
    errorMsg.value = '로그인 실패 · 다시 시도'
    loading.value = false
  }
}
</script>
