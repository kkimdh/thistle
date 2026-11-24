<template>
  <div
    v-if="status === 'offline'"
    class="fixed inset-x-0 top-0 z-[100] bg-red-600 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white shadow-lg"
  >
    <div class="mx-auto flex max-w-6xl items-center gap-3">
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-6"
        >
          <path d="M2 2l20 20" />
          <path d="M8.5 16.5a5 5 0 0 1 7 0" />
          <path d="M5 13a10 10 0 0 1 5.17-2.8" />
          <path d="M19 13a10 10 0 0 0-2.4-1.7" />
          <path d="M2 8.8a15 15 0 0 1 4.2-2.6" />
          <path d="M22 8.8A15 15 0 0 0 11 4.6" />
          <path d="M12 20h.01" />
        </svg>
      </span>
      <div class="flex min-w-0 flex-1 flex-col">
        <b class="text-[15px] sm:text-base">인터넷 연결이 끊겼어요</b>
        <span class="text-[13px] text-white/90"
          >지금은 저장·완료 처리가 안 될 수 있음</span
        >
      </div>
      <button
        type="button"
        class="h-10 shrink-0 rounded-lg bg-white px-3 text-sm font-bold text-red-700"
        @click="recheck"
      >
        다시 확인
      </button>
    </div>
  </div>

  <div
    v-else-if="status === 'paused'"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-forest-900/95 p-6"
  >
    <div
      class="flex w-full max-w-md flex-col gap-5 rounded-2xl bg-white p-6 text-center"
    >
      <div
        class="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-50 text-2xl"
      >
        💤
      </div>
      <div class="flex flex-col gap-2">
        <h1 class="text-xl font-bold">DB가 잠들어 있음</h1>
        <p class="text-sm leading-6 text-stone-600">
          7일 넘게 안 쓰면 Supabase가 일시정지돼요. 데이터는 그대로예요.<br />
          복원하면 2~3분 뒤 다시 쓸 수 있어요. 잘 모르겠으면 도혜에게 연락!
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <a
          :href="dashboardUrl"
          target="_blank"
          rel="noopener"
          class="flex h-12 items-center justify-center rounded-xl bg-forest-600 font-bold text-white"
          >Supabase에서 복원하기</a
        >
        <button
          type="button"
          class="h-12 rounded-xl border border-stone-300"
          @click="recheck"
        >
          다시 확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const status = useState<"ok" | "paused" | "offline">("dbStatus", () => "ok");
const dashboardUrl =
  "https://supabase.com/dashboard/project/bjkblezkhnsriqeyaezl";

const recheck = () => {
  window.location.reload();
};
</script>
