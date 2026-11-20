<template>
  <BaseModal :open="open" title="엑셀 백업" description="자동 백업 기능 없음 · 데이터가 날아가지 않게 주기적으로 내려받기" @close="emit('close')">
    <div class="flex items-center justify-between rounded-lg bg-stone-50 px-4 py-3 text-sm">
      <span class="text-stone-500">마지막 백업 (이 기기)</span>
      <b>{{ lastBackupText }}</b>
    </div>
    <div class="rounded-lg border border-stone-200 px-4 py-3 text-sm leading-6 text-stone-700">
      <b>엉겅퀴_백업_{{ todayStr() }}.xlsx</b><br />
      시트: {{ sheetNames }}<br />
      잔여 1회인 집은 빨갛게 표시
    </div>
    <p v-if="errorMsg" class="text-sm font-bold text-red-700">{{ errorMsg }}</p>
    <template #footer>
      <button type="button" class="ml-auto h-11 rounded-lg border border-stone-300 px-4" @click="emit('close')">닫기</button>
      <button type="button" class="h-11 rounded-lg bg-forest-600 px-5 font-bold text-white disabled:opacity-60" :disabled="working" @click="download">
        {{ working ? '만드는 중…' : '엑셀 내려받기' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { Area, Customer } from '~/utils/thistle'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const supabase = useSupabaseClient<any>()

const STORAGE_KEY = 'thistle-last-backup'
const areas = ref<Area[]>([])
const lastBackup = ref('')
const working = ref(false)
const errorMsg = ref('')

const readLastBackup = () => {
  try {
    lastBackup.value = localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    lastBackup.value = ''
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    errorMsg.value = ''
    readLastBackup()
    const { data } = await supabase.from('areas').select('id, name, sort_order').order('sort_order')
    areas.value = (data ?? []) as Area[]
  },
)

const lastBackupText = computed(() => {
  if (!lastBackup.value) return '없음'
  const days = Math.round((fromDateStr(todayStr()).getTime() - fromDateStr(lastBackup.value).getTime()) / 86400000)
  return `${formatMD(lastBackup.value)} · ${days === 0 ? '오늘' : `${days}일 전`}`
})

const sheetNames = computed(() => [...areas.value.map((a) => a.name), '전체'].join(' · '))

const download = async () => {
  working.value = true
  errorMsg.value = ''
  try {
    const [areaRes, customerRes] = await Promise.all([
      supabase.from('areas').select('id, name, sort_order').order('sort_order'),
      supabase.from('customers').select('*'),
    ])
    if (areaRes.error || customerRes.error) throw new Error(areaRes.error?.message ?? customerRes.error?.message)
    const blob = await buildBackupWorkbook(areaRes.data as Area[], customerRes.data as Customer[])
    downloadBlob(blob, `엉겅퀴_백업_${todayStr()}.xlsx`)
    try {
      localStorage.setItem(STORAGE_KEY, todayStr())
    } catch {}
    readLastBackup()
  } catch (e: any) {
    errorMsg.value = `백업 실패 · ${e.message}`
  } finally {
    working.value = false
  }
}
</script>
