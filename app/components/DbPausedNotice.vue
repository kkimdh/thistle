<template>
  <div v-if="paused" class="fixed inset-0 z-[100] flex items-center justify-center bg-forest-900/95 p-6">
    <div class="flex w-full max-w-md flex-col gap-5 rounded-2xl bg-white p-6 text-center">
      <div class="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-50 text-2xl">💤</div>
      <div class="flex flex-col gap-2">
        <h1 class="text-xl font-bold">DB가 잠들어 있음</h1>
        <p class="text-sm leading-6 text-stone-600">
          7일 넘게 안 쓰면 Supabase가 일시정지돼요. 데이터는 그대로예요.<br />
          도혜 계정으로 복원하면 2~3분 뒤 다시 쓸 수 있어요.
        </p>
        <p class="text-xs text-stone-500">사장님은 도혜에게 연락 · 인터넷이 끊겨도 이 화면이 뜰 수 있음</p>
      </div>
      <div class="flex flex-col gap-2">
        <a :href="dashboardUrl" target="_blank" rel="noopener" class="flex h-12 items-center justify-center rounded-xl bg-forest-600 font-bold text-white">Supabase에서 복원하기</a>
        <button type="button" class="h-12 rounded-xl border border-stone-300" @click="recheck">다시 확인</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const paused = useState('dbPaused', () => false)
const dashboardUrl = 'https://supabase.com/dashboard/project/bjkblezkhnsriqeyaezl'

const recheck = () => {
  window.location.reload()
}
</script>
