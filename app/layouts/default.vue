<template>
  <div class="min-h-dvh bg-stone-50 text-stone-900">
    <header v-if="showHeader" class="bg-forest-900 text-white">
      <div class="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-7">
        <NuxtLink to="/" class="flex items-center gap-2 text-lg font-bold">
          <img src="/logo.png" alt="" class="size-9 rounded-lg bg-white object-contain p-0.5" />
          <span class="hidden sm:inline">엉겅퀴</span>
        </NuxtLink>
        <nav class="ml-1 flex gap-1 sm:ml-4">
          <NuxtLink
            v-for="menu in menus"
            :key="menu.to"
            :to="menu.to"
            class="rounded-lg px-3 py-2 text-[15px] text-forest-100"
            exact-active-class="!bg-forest-600 !text-white font-bold"
          >
            {{ menu.label }}
          </NuxtLink>
        </nav>
        <button type="button" class="ml-auto rounded-lg px-3 py-2 text-sm text-forest-100" @click="logout">로그아웃</button>
      </div>
    </header>
    <slot />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient<any>()

const menus = [
  { to: '/', label: '배달 리스트' },
  { to: '/customers', label: '고객 관리' },
]

const showHeader = computed(() => !['/login', '/confirm', '/blocked'].includes(route.path))

const logout = async () => {
  await supabase.auth.signOut()
  useState('allowed').value = null
  window.location.href = '/login'
}
</script>
