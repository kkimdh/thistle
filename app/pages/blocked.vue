<template>
  <div class="min-h-dvh flex flex-col items-center justify-center gap-6 p-6 text-center">
    <div class="size-16 rounded-full bg-red-50 flex items-center justify-center text-3xl">🔒</div>
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold">접근 권한 없음</h1>
      <p class="text-stone-600">이 카카오 계정은 엉겅퀴에 등록되지 않음<br />관리자에게 아래 ID 전달</p>
    </div>
    <code v-if="userId" class="rounded-lg bg-stone-100 px-3 py-2 text-sm break-all select-all">{{ userId }}</code>
    <div class="w-full max-w-sm flex flex-col gap-2">
      <button type="button" class="h-12 rounded-xl bg-forest-600 text-white font-bold" @click="recheck">다시 확인</button>
      <button type="button" class="h-12 rounded-xl border border-stone-300" @click="logout">다른 계정으로 로그인</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient<any>()
const userId = ref('')

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  userId.value = data.user?.id ?? ''
})

const recheck = () => {
  window.location.href = '/'
}

const logout = async () => {
  await supabase.auth.signOut()
  window.location.href = '/login'
}
</script>
