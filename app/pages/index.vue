<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-32 pt-6 sm:px-7 md:pb-8">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="mr-auto text-2xl font-bold">배달 리스트</h1>
      <button v-if="!isHoliday" type="button" class="h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm sm:px-4" @click="openHoliday">이 날 휴무로 지정</button>
      <button v-else type="button" class="h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm sm:px-4" @click="removeHoliday">휴무 해제</button>
      <button type="button" class="h-11 rounded-lg bg-forest-600 px-4 font-bold text-white disabled:opacity-40" :disabled="isHoliday" @click="requestOpen = true">+ 배달 신청</button>
    </div>

    <div class="no-scrollbar flex items-stretch gap-1.5 overflow-x-auto">
      <button type="button" aria-label="이전 주" class="w-10 shrink-0 rounded-lg border border-stone-300 bg-white text-lg" @click="moveWeek(-7)">‹</button>
      <button v-for="d in dateTabs" :key="d.date" type="button" :class="dateClass(d)" @click="selectDate(d.date)">
        <b class="text-[15px]" :class="d.holiday ? 'line-through' : ''">{{ d.label }}</b>
        <span class="text-xs">{{ d.sub }}</span>
      </button>
      <button type="button" aria-label="다음 주" class="w-10 shrink-0 rounded-lg border border-stone-300 bg-white text-lg" @click="moveWeek(7)">›</button>
    </div>

    <p v-if="loading" class="py-10 text-center text-stone-500">불러오는 중…</p>
    <p v-else-if="loadError" class="py-10 text-center font-bold text-red-700">{{ loadError }}</p>

    <div v-else-if="isHoliday" class="flex flex-col items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-14 text-center">
      <span class="rounded-md bg-stone-200 px-3 py-1 text-sm font-bold text-stone-600">휴무</span>
      <b class="text-xl">{{ dateLabel(selectedDate) }} 휴무</b>
      <span class="text-stone-500">{{ holidayReason || '사유 없음' }} · 이 날은 배달 신청 불가</span>
    </div>

    <template v-else>
      <div class="flex flex-wrap gap-2">
        <button v-for="chip in areaChips" :key="chip.id" type="button" :class="chipClass(areaFilter === chip.id)" @click="areaFilter = chip.id">
          {{ chip.name }} <span class="font-normal">{{ chip.count }}</span>
        </button>
      </div>

      <div v-if="zeroFixed.length" class="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
        고정 손님 중 <b>잔여 0회</b>라 자동으로 빠진 집 {{ zeroFixed.length }}곳 ({{ zeroFixed.map((c) => c.address).join(', ') }}) ·
        <NuxtLink to="/customers" class="font-bold underline">고객 관리에서 횟수 추가</NuxtLink>
      </div>
      <div v-if="missingCount" class="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
        잔여 횟수 미입력 <b>{{ missingCount }}곳</b> · 미입력이면 완료 처리 안 됨 ·
        <NuxtLink to="/customers?state=empty" class="font-bold underline">고객 관리에서 입력</NuxtLink>
      </div>

      <div class="flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5">
        <button type="button" class="flex h-10 items-center gap-2 px-1 text-sm" @click="toggleAll">
          <span :class="boxClass(allSelected)">{{ allSelected ? '✓' : '' }}</span>
          전체 선택 <span class="text-stone-500">· {{ selected.length }}곳 선택됨</span>
        </button>
        <span class="ml-auto hidden text-sm text-stone-500 lg:inline">{{ summary }}</span>
        <div class="hidden gap-2 md:flex">
          <button type="button" class="h-10 rounded-lg bg-forest-600 px-4 font-bold text-white disabled:opacity-40" :disabled="!completeTargets.length" @click="confirmOpen = true">배달 완료 처리</button>
          <button type="button" class="h-10 rounded-lg border border-forest-600 px-4 font-bold text-forest-700 disabled:opacity-40" :disabled="!printRows.length" @click="downloadWord">{{ wordLabel }}</button>
        </div>
      </div>

      <div class="hidden overflow-x-auto rounded-xl border border-stone-200 bg-white md:block">
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-left text-[13px] text-stone-500">
            <tr>
              <th class="w-12 px-3 py-2.5 font-medium">선택</th>
              <th class="px-3 py-2.5 font-medium">동네</th>
              <th class="px-3 py-2.5 font-medium">주소</th>
              <th class="px-3 py-2.5 font-medium">구분</th>
              <th class="px-3 py-2.5 font-medium">공동현관</th>
              <th class="px-3 py-2.5 font-medium">사이즈·그릇</th>
              <th class="px-3 py-2.5 font-medium">잔여</th>
              <th class="px-3 py-2.5 font-medium">배달</th>
              <th class="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in visibleRows" :key="r.c.id" :class="['border-t border-stone-100', rowBg(r)]">
              <td class="px-3 py-2.5">
                <button type="button" :aria-label="`${r.c.address} 선택`" class="flex size-9 items-center justify-center" @click="toggleSelect(r.c.id)">
                  <span :class="boxClass(selected.includes(r.c.id))">{{ selected.includes(r.c.id) ? '✓' : '' }}</span>
                </button>
              </td>
              <td class="px-3 py-2.5 text-stone-600">{{ areaName(r.c.area_id) }}</td>
              <td class="px-3 py-2.5">
                <b class="text-[15px]">{{ r.c.address }}</b>
                <div v-if="r.c.note" class="mt-1 inline-block whitespace-pre-line rounded-md bg-amber-50 px-2 py-0.5 text-[13px] text-amber-900 ml-2">{{ r.c.note }}</div>
              </td>
              <td class="px-3 py-2.5"><span :class="kindClass(r)">{{ kindLabel(r) }}</span></td>
              <td class="px-3 py-2.5">{{ r.c.door_code || '-' }}</td>
              <td class="px-3 py-2.5"><CustomerTags :size="r.c.size" :own-bowl="r.c.own_bowl" /></td>
              <td class="px-3 py-2.5"><RemainBadge :value="r.c.remaining" /></td>
              <td class="px-3 py-2.5">
                <span v-if="r.done" class="inline-flex h-9 items-center rounded-lg bg-forest-50 px-3 font-bold text-forest-700">✓ 완료</span>
                <button v-else type="button" class="h-9 rounded-lg border border-forest-600 px-4 font-bold text-forest-700 disabled:opacity-40" :disabled="!canComplete(r)" @click="completeOne(r)">완료</button>
              </td>
              <td class="px-3 py-2.5 text-right">
                <button type="button" class="h-9 whitespace-nowrap rounded-lg border border-stone-300 px-3 text-stone-600" @click="rowAction(r)">{{ rowActionLabel(r) }}</button>
              </td>
            </tr>
            <tr v-if="!visibleRows.length">
              <td colspan="9" class="px-3 py-12 text-center text-stone-500">이 날 배달할 집 없음 · [+ 배달 신청]으로 추가</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-2 md:hidden">
        <div v-for="r in visibleRows" :key="r.c.id" :class="['flex items-start gap-2 rounded-xl border p-3', rowBg(r) || 'bg-white', r.c.remaining === 1 ? 'border-red-200' : 'border-stone-200']">
          <button type="button" :aria-label="`${r.c.address} 선택`" class="flex size-9 shrink-0 items-center justify-center" @click="toggleSelect(r.c.id)">
            <span :class="boxClass(selected.includes(r.c.id))">{{ selected.includes(r.c.id) ? '✓' : '' }}</span>
          </button>
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <b class="text-[15px]">{{ r.c.address }}</b>
            <span class="text-[13px] text-stone-500">{{ areaName(r.c.area_id) }}<template v-if="r.c.door_code"> · 공동현관 {{ r.c.door_code }}</template></span>
            <div v-if="r.c.note" class="whitespace-pre-line rounded-md bg-amber-50 px-2 py-1 text-[13px] text-amber-900">{{ r.c.note }}</div>
            <div class="flex flex-wrap items-center gap-1.5">
              <span :class="kindClass(r)">{{ kindLabel(r) }}</span>
              <CustomerTags :size="r.c.size" :own-bowl="r.c.own_bowl" />
              <RemainBadge :value="r.c.remaining" prefix="잔여 " />
            </div>
            <button type="button" class="self-start text-xs text-stone-500 underline" @click="rowAction(r)">{{ rowActionLabel(r) }}</button>
          </div>
          <span v-if="r.done" class="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-sm font-bold text-forest-700">✓ 완료</span>
          <button v-else type="button" class="h-12 w-16 shrink-0 rounded-xl border border-forest-600 font-bold text-forest-700 disabled:opacity-40" :disabled="!canComplete(r)" @click="completeOne(r)">완료</button>
        </div>
        <p v-if="!visibleRows.length" class="py-12 text-center text-stone-500">이 날 배달할 집 없음</p>
      </div>

      <p class="text-[13px] leading-6 text-stone-500">
        · 고정 손님은 그 요일에 자동 포함, 연락 온 손님은 [+ 배달 신청]으로 넣기<br />
        · 못 받는다는 연락이 오면 고정은 [이번만 빼기], 신청은 [신청 취소] — 둘 다 차감 없음
      </p>
    </template>

    <div v-if="!isHoliday" class="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-stone-200 bg-white px-3 pb-6 pt-3 md:hidden">
      <button type="button" class="h-12 rounded-xl bg-forest-600 font-bold text-white disabled:opacity-40" :disabled="!completeTargets.length" @click="confirmOpen = true">배달 완료 {{ completeTargets.length || '' }}</button>
      <button type="button" class="h-12 rounded-xl border border-forest-600 font-bold text-forest-700 disabled:opacity-40" :disabled="!printRows.length" @click="downloadWord">워드로 출력</button>
    </div>

    <div v-if="toast" class="fixed inset-x-3 bottom-24 z-40 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-stone-900 px-4 py-3 text-sm text-white md:bottom-8">
      <span class="flex-1">{{ toast.text }}</span>
      <button v-if="toast.undoIds.length" type="button" class="h-9 rounded-lg bg-stone-700 px-3 font-bold" @click="undoToast">되돌리기</button>
    </div>

    <BaseModal :open="confirmOpen" :title="`${completeTargets.length}곳 배달 완료 처리할까?`" description="완료하면 각 집의 잔여 횟수가 1회씩 줄어듦" @close="confirmOpen = false">
      <div class="flex max-h-[40dvh] flex-col gap-1.5 overflow-y-auto">
        <div v-for="r in completeTargets" :key="r.c.id" class="flex items-center justify-between gap-3 rounded-lg border border-stone-200 px-3 py-2 text-sm">
          <span class="min-w-0"><b>{{ r.c.address }}</b> <span class="text-xs text-stone-500">{{ areaName(r.c.area_id) }}</span></span>
          <span class="shrink-0">잔여 {{ r.c.remaining }} → <b :class="r.c.remaining === 2 ? 'text-red-700' : ''">{{ (r.c.remaining ?? 1) - 1 }}회</b></span>
        </div>
      </div>
      <p v-if="selected.length > completeTargets.length" class="text-sm text-amber-900">잔여 미입력·이미 완료한 {{ selected.length - completeTargets.length }}곳은 빠짐</p>
      <template #footer>
        <button type="button" class="ml-auto h-11 rounded-lg border border-stone-300 px-4" @click="confirmOpen = false">취소</button>
        <button type="button" class="h-11 rounded-lg bg-forest-600 px-5 font-bold text-white disabled:opacity-60" :disabled="busy" @click="completeSelected">배달 완료 처리</button>
      </template>
    </BaseModal>

    <BaseModal :open="holidayOpen" :title="`${dateLabel(selectedDate)} 휴무로 지정`" description="지정하면 이 날은 배달 신청 불가" @close="holidayOpen = false">
      <label class="flex flex-col gap-1.5 text-sm font-medium">
        사유 <span class="text-xs font-normal text-stone-500">선택 · 리스트에만 표시</span>
        <input v-model="holidayReasonDraft" type="text" placeholder="예: 사업장 사정, 성탄절" class="h-11 rounded-lg border border-stone-300 px-3 text-[15px]" />
      </label>
      <div v-if="plannedRequests.length" class="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">이미 신청된 {{ plannedRequests.length }}곳 있음 · 휴무로 지정하면 신청 취소됨 (차감 없음)</div>
      <template #footer>
        <button type="button" class="ml-auto h-11 rounded-lg border border-stone-300 px-4" @click="holidayOpen = false">취소</button>
        <button type="button" class="h-11 rounded-lg bg-forest-600 px-5 font-bold text-white disabled:opacity-60" :disabled="busy" @click="saveHoliday">휴무로 지정</button>
      </template>
    </BaseModal>

    <RequestAddModal
      :open="requestOpen"
      :initial-date="selectedDate"
      :dates="dateTabs"
      :areas="areas"
      :customers="sortedCustomers"
      :existing-by-date="existingByDate"
      @close="requestOpen = false"
      @saved="onRequested"
    />
  </div>
</template>

<script setup lang="ts">
import type { Area, Customer, Delivery, Holiday } from '~/utils/thistle'

interface Row {
  c: Customer
  del: Delivery | null
  kind: 'request' | 'fixed'
  done: boolean
}

const supabase = useSupabaseClient<any>()

const areas = ref<Area[]>([])
const customers = ref<Customer[]>([])
const deliveries = ref<Delivery[]>([])
const holidays = ref<Holiday[]>([])
const loading = ref(true)
const loadError = ref('')
const busy = ref(false)

const today = todayStr()
const selectedDate = ref(nextDeliveryDate(today))
const weekStart = computed(() => mondayOf(selectedDate.value))
const areaFilter = ref('all')
const selected = ref<string[]>([])

const confirmOpen = ref(false)
const holidayOpen = ref(false)
const holidayReasonDraft = ref('')
const requestOpen = ref(false)
const toast = ref<{ text: string; undoIds: string[]; date: string } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const loadBase = async () => {
  const [areaRes, customerRes] = await Promise.all([
    supabase.from('areas').select('id, name, sort_order').order('sort_order'),
    supabase.from('customers').select('*'),
  ])
  if (areaRes.error || customerRes.error) throw new Error(areaRes.error?.message ?? customerRes.error?.message)
  areas.value = areaRes.data as Area[]
  customers.value = customerRes.data as Customer[]
}

const loadWeek = async () => {
  const from = weekStart.value
  const to = addDays(from, 6)
  const [delRes, holRes] = await Promise.all([
    supabase.from('deliveries').select('id, customer_id, delivery_date, kind, status').gte('delivery_date', from).lte('delivery_date', to),
    supabase.from('holidays').select('day, reason').gte('day', from).lte('day', to),
  ])
  if (delRes.error || holRes.error) throw new Error(delRes.error?.message ?? holRes.error?.message)
  deliveries.value = delRes.data as Delivery[]
  holidays.value = holRes.data as Holiday[]
}

const reload = async (withBase = true) => {
  try {
    loadError.value = ''
    if (withBase) await loadBase()
    await loadWeek()
  } catch (e: any) {
    loadError.value = `불러오기 실패 · ${e.message}`
  } finally {
    loading.value = false
  }
}

onMounted(() => reload(true))
watch(weekStart, () => reload(false))

const areaName = (id: string) => areas.value.find((a) => a.id === id)?.name ?? '-'
const areaOrder = (id: string) => areas.value.find((a) => a.id === id)?.sort_order ?? 999

const sortedCustomers = computed(() =>
  [...customers.value].sort(
    (x, y) =>
      areaOrder(x.area_id) - areaOrder(y.area_id) ||
      (x.sort_order ?? 100000) - (y.sort_order ?? 100000) ||
      x.address.localeCompare(y.address, 'ko'),
  ),
)

const holidayOf = (date: string) => holidays.value.find((h) => h.day === date)

const buildDay = (date: string) => {
  const key = weekdayKey(date)
  const dels = new Map(deliveries.value.filter((d) => d.delivery_date === date).map((d) => [d.customer_id, d]))
  const rows: Row[] = []
  const zero: Customer[] = []
  if (holidayOf(date)) return { rows, zero }
  for (const c of sortedCustomers.value) {
    const del = dels.get(c.id) ?? null
    const isFixed = !!key && c.fixed_days.includes(key)
    if (del) {
      if (del.status === 'skipped') continue
      rows.push({ c, del, kind: del.kind, done: del.status === 'done' })
    } else if (isFixed) {
      if (c.remaining === 0) {
        zero.push(c)
        continue
      }
      rows.push({ c, del: null, kind: 'fixed', done: false })
    }
  }
  return { rows, zero }
}

const dayData = computed(() => buildDay(selectedDate.value))
const isHoliday = computed(() => !!holidayOf(selectedDate.value))
const holidayReason = computed(() => holidayOf(selectedDate.value)?.reason ?? '')
const zeroFixed = computed(() => dayData.value.zero)

const dateTabs = computed(() =>
  weekDeliveryDates(weekStart.value).map((date) => {
    const holiday = !!holidayOf(date)
    const count = buildDay(date).rows.length
    return {
      date,
      label: dateLabel(date),
      holiday,
      sub: holiday ? '휴무' : `${date < today ? '지난 배달 · ' : ''}${count}곳`,
    }
  }),
)

const existingByDate = computed(() => {
  const map: Record<string, string[]> = {}
  for (const date of weekDeliveryDates(weekStart.value)) map[date] = buildDay(date).rows.map((r) => r.c.id)
  return map
})

const visibleRows = computed(() => dayData.value.rows.filter((r) => areaFilter.value === 'all' || r.c.area_id === areaFilter.value))

const areaChips = computed(() => [
  { id: 'all', name: '전체', count: dayData.value.rows.length },
  ...areas.value.map((a) => ({ id: a.id, name: a.name, count: dayData.value.rows.filter((r) => r.c.area_id === a.id).length })),
])

const missingCount = computed(() => dayData.value.rows.filter((r) => r.c.remaining === null).length)

const summary = computed(() => {
  const rows = visibleRows.value
  const big = rows.filter((r) => r.c.size === '4-5').length
  const bowl = rows.filter((r) => r.c.own_bowl).length
  return `${dateLabel(selectedDate.value)} · 4-5인분 ${big} · 2-3인분 ${rows.length - big} · 개인 그릇 ${bowl}`
})

const plannedRequests = computed(() => deliveries.value.filter((d) => d.delivery_date === selectedDate.value && d.kind === 'request' && d.status === 'planned'))

const canComplete = (r: Row) => !r.done && (r.c.remaining ?? 0) > 0
const completeTargets = computed(() => visibleRows.value.filter((r) => selected.value.includes(r.c.id) && canComplete(r)))
const allSelected = computed(() => visibleRows.value.length > 0 && visibleRows.value.every((r) => selected.value.includes(r.c.id)))

watch([selectedDate, areaFilter], () => {
  selected.value = []
})

const selectDate = (date: string) => {
  selectedDate.value = date
}

const moveWeek = (days: number) => {
  selectedDate.value = addDays(weekStart.value, days)
}

const toggleSelect = (id: string) => {
  selected.value = selected.value.includes(id) ? selected.value.filter((x) => x !== id) : [...selected.value, id]
}

const toggleAll = () => {
  selected.value = allSelected.value ? [] : visibleRows.value.map((r) => r.c.id)
}

const showToast = (text: string, undoIds: string[] = []) => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { text, undoIds, date: selectedDate.value }
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 8000)
}

const runComplete = async (ids: string[]) => {
  busy.value = true
  const { data, error } = await supabase.rpc('complete_deliveries', { p_date: selectedDate.value, p_customer_ids: ids })
  busy.value = false
  if (error) {
    showToast(`완료 처리 실패 · ${error.message}`)
    return
  }
  await reload(true)
  showToast(`${data}곳 배달 완료 · 잔여 1회씩 차감`, ids)
}

const completeOne = (r: Row) => runComplete([r.c.id])

const completeSelected = async () => {
  const ids = completeTargets.value.map((r) => r.c.id)
  confirmOpen.value = false
  selected.value = []
  await runComplete(ids)
}

const runUndo = async (date: string, ids: string[]) => {
  busy.value = true
  const { data, error } = await supabase.rpc('undo_deliveries', { p_date: date, p_customer_ids: ids })
  busy.value = false
  if (error) {
    showToast(`되돌리기 실패 · ${error.message}`)
    return
  }
  await reload(true)
  showToast(`${data}곳 완료 취소 · 잔여 돌려놓음`)
}

const undoToast = () => {
  if (!toast.value) return
  runUndo(toast.value.date, toast.value.undoIds)
}

const kindLabel = (r: Row) => (r.kind === 'request' ? '신청' : `고정 ${fixedDaysLabel(r.c.fixed_days)}`)

const kindClass = (r: Row) =>
  r.kind === 'request'
    ? 'rounded-md bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-800'
    : 'rounded-md border border-forest-300 bg-white px-2 py-0.5 text-xs font-bold text-forest-800'

const rowActionLabel = (r: Row) => (r.done ? '완료 취소' : r.kind === 'request' ? '신청 취소' : '이번만 빼기')

const rowAction = async (r: Row) => {
  if (r.done) {
    await runUndo(selectedDate.value, [r.c.id])
    return
  }
  busy.value = true
  const { error } =
    r.kind === 'request' && r.del
      ? await supabase.from('deliveries').delete().eq('id', r.del.id)
      : await supabase
          .from('deliveries')
          .upsert({ customer_id: r.c.id, delivery_date: selectedDate.value, kind: 'fixed', status: 'skipped' }, { onConflict: 'customer_id,delivery_date' })
  busy.value = false
  if (error) {
    showToast(`처리 실패 · ${error.message}`)
    return
  }
  await reload(false)
  showToast(r.kind === 'request' ? `${r.c.address} 신청 취소 · 차감 없음` : `${r.c.address} 이번만 빼기 · 차감 없음`)
}

const openHoliday = () => {
  holidayReasonDraft.value = ''
  holidayOpen.value = true
}

const saveHoliday = async () => {
  busy.value = true
  const date = selectedDate.value
  const { error } = await supabase.from('holidays').upsert({ day: date, reason: holidayReasonDraft.value.trim() || null })
  if (!error && plannedRequests.value.length) {
    await supabase.from('deliveries').delete().in('id', plannedRequests.value.map((d) => d.id))
  }
  busy.value = false
  holidayOpen.value = false
  if (error) {
    showToast(`휴무 지정 실패 · ${error.message}`)
    return
  }
  await reload(false)
  showToast(`${dateLabel(date)} 휴무로 지정`)
}

const removeHoliday = async () => {
  const { error } = await supabase.from('holidays').delete().eq('day', selectedDate.value)
  if (error) {
    showToast(`휴무 해제 실패 · ${error.message}`)
    return
  }
  await reload(false)
  showToast(`${dateLabel(selectedDate.value)} 휴무 해제`)
}

const onRequested = async (date: string, count: number) => {
  requestOpen.value = false
  selectedDate.value = date
  await reload(false)
  showToast(`${count}곳 ${dateLabel(date)}에 신청`)
}

const dateClass = (d: { date: string; holiday: boolean }) => [
  'flex min-w-28 shrink-0 flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left',
  d.date === selectedDate.value
    ? 'border-forest-600 bg-forest-600 text-white'
    : d.holiday
      ? 'border-stone-200 bg-stone-200 text-stone-500'
      : 'border-stone-300 bg-white',
]

const chipClass = (on: boolean) => [
  'h-10 rounded-full border px-4 text-sm font-bold',
  on ? 'border-forest-600 bg-forest-600 text-white' : 'border-stone-300 bg-white',
]

const boxClass = (on: boolean) => [
  'flex size-5 items-center justify-center rounded border-2 text-xs text-white',
  on ? 'border-forest-600 bg-forest-600' : 'border-stone-400 bg-white',
]

const printRows = computed(() =>
  selected.value.length ? visibleRows.value.filter((r) => selected.value.includes(r.c.id)) : visibleRows.value,
)

const wordLabel = computed(() => {
  if (selected.value.length) return `선택한 ${selected.value.length}곳 워드로 출력`
  if (areaFilter.value !== 'all') return `${areaName(areaFilter.value)} 워드로 출력`
  return '동네별 워드로 출력'
})

const downloadWord = async () => {
  const rows = printRows.value
  if (!rows.length) return
  const groups = areas.value
    .map((a) => ({ name: a.name, items: rows.filter((r) => r.c.area_id === a.id).map((r) => r.c) }))
    .filter((g) => g.items.length)
  try {
    for (const g of groups) {
      const blob = await buildDeliveryDoc(g.items)
      downloadBlob(blob, `${g.name}.docx`)
      await new Promise((resolve) => setTimeout(resolve, 400))
    }
  } catch (e: any) {
    showToast(`워드 만들기 실패 · ${e.message}`)
  }
}

const rowBg = (r: Row) => (r.c.remaining === 1 && !r.done ? 'bg-red-50/60' : selected.value.includes(r.c.id) ? 'bg-forest-50' : '')
</script>
