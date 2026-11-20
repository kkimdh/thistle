<template>
  <BaseModal :open="open" title="배달 신청 추가" description="연락 온 집 골라서 날짜에 넣기" @close="emit('close')">
    <div class="flex flex-col gap-1.5 text-sm font-medium">
      배달 날짜
      <div class="grid grid-cols-3 gap-1.5">
        <button
          v-for="d in dates"
          :key="d.date"
          type="button"
          :disabled="d.holiday"
          :class="[optClass(date === d.date), d.holiday ? 'line-through opacity-50' : '']"
          @click="date = d.date"
        >
          {{ d.label }}
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-1.5">
      <button v-for="chip in areaChips" :key="chip.id" type="button" :class="chipClass(areaFilter === chip.id)" @click="areaFilter = chip.id">{{ chip.name }}</button>
    </div>
    <input v-model="keyword" type="search" placeholder="주소·특이사항 검색" class="h-11 rounded-lg border border-stone-300 px-3 text-[15px]" />

    <div class="flex max-h-[40dvh] flex-col gap-1.5 overflow-y-auto">
      <button
        v-for="c in list"
        :key="c.id"
        type="button"
        :disabled="c.disabled"
        :class="[
          'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left',
          picked.includes(c.id) ? 'border-forest-600 bg-forest-50' : 'border-stone-200 bg-white',
          c.disabled ? 'opacity-50' : '',
        ]"
        @click="togglePick(c.id)"
      >
        <span :class="['flex size-5 shrink-0 items-center justify-center rounded border-2 text-xs text-white', picked.includes(c.id) ? 'border-forest-600 bg-forest-600' : 'border-stone-400']">{{ picked.includes(c.id) ? '✓' : '' }}</span>
        <span class="flex min-w-0 flex-1 flex-col">
          <b class="text-[15px]">{{ c.address }}</b>
          <span class="text-xs text-stone-500">{{ c.sub }}</span>
        </span>
        <span class="shrink-0 text-sm font-bold" :class="c.remaining === 0 ? 'text-stone-400' : ''">{{ c.remaining === null ? '미입력' : `${c.remaining}회` }}</span>
      </button>
      <p v-if="!list.length" class="py-6 text-center text-sm text-stone-500">검색 결과 없음</p>
    </div>
    <p v-if="errorMsg" class="text-sm font-bold text-red-700">{{ errorMsg }}</p>

    <template #footer>
      <button type="button" class="ml-auto h-11 rounded-lg border border-stone-300 px-4" @click="emit('close')">취소</button>
      <button type="button" class="h-11 rounded-lg bg-forest-600 px-5 font-bold text-white disabled:opacity-50" :disabled="!picked.length || saving" @click="save">
        {{ picked.length ? `${picked.length}곳 ${dateLabel(date)}에 신청` : '집 선택' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { Area, Customer } from '~/utils/thistle'

const props = defineProps<{
  open: boolean
  initialDate: string
  dates: { date: string; label: string; holiday: boolean }[]
  areas: Area[]
  customers: Customer[]
  existingByDate: Record<string, string[]>
}>()
const emit = defineEmits<{ close: []; saved: [date: string, count: number] }>()
const supabase = useSupabaseClient<any>()

const date = ref('')
const areaFilter = ref('all')
const keyword = ref('')
const picked = ref<string[]>([])
const saving = ref(false)
const errorMsg = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    date.value = props.initialDate
    areaFilter.value = 'all'
    keyword.value = ''
    picked.value = []
    errorMsg.value = ''
  },
)

watch(date, () => {
  picked.value = []
})

const areaName = (id: string) => props.areas.find((a) => a.id === id)?.name ?? '-'

const areaChips = computed(() => [{ id: 'all', name: '전체' }, ...props.areas.map((a) => ({ id: a.id, name: a.name }))])

const list = computed(() => {
  const existing = props.existingByDate[date.value] ?? []
  const word = keyword.value.trim()
  return props.customers
    .filter((c) => areaFilter.value === 'all' || c.area_id === areaFilter.value)
    .filter((c) => !word || c.address.includes(word) || (c.note ?? '').includes(word))
    .map((c) => {
      const already = existing.includes(c.id)
      const size = c.size === '4-5' ? '4-5인분' : '2-3인분'
      const notes = [areaName(c.area_id), size]
      if (already) notes.push('이미 이 날 리스트에 있음')
      else if (c.remaining === 0) notes.push('잔여 없음 · 횟수 추가 필요')
      return { id: c.id, address: c.address, remaining: c.remaining, sub: notes.join(' · '), disabled: already || c.remaining === 0 }
    })
})

const togglePick = (id: string) => {
  picked.value = picked.value.includes(id) ? picked.value.filter((x) => x !== id) : [...picked.value, id]
}

const optClass = (on: boolean) => [
  'min-h-11 rounded-lg border px-2 py-1.5 text-sm',
  on ? 'border-forest-600 bg-forest-100 font-bold text-forest-800' : 'border-stone-300 bg-white',
]

const chipClass = (on: boolean) => [
  'h-9 rounded-full border px-3 text-sm font-bold',
  on ? 'border-forest-600 bg-forest-600 text-white' : 'border-stone-300 bg-white',
]

const save = async () => {
  saving.value = true
  errorMsg.value = ''
  const rows = picked.value.map((id) => ({ customer_id: id, delivery_date: date.value, kind: 'request', status: 'planned' }))
  const { error } = await supabase.from('deliveries').upsert(rows, { onConflict: 'customer_id,delivery_date' })
  saving.value = false
  if (error) {
    errorMsg.value = `신청 실패 · ${error.message}`
    return
  }
  emit('saved', date.value, rows.length)
}
</script>
