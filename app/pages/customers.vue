<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:px-7">
    <div class="flex items-center gap-2">
      <h1 class="mr-auto text-2xl font-bold">고객 관리</h1>
      <button type="button" class="h-11 rounded-lg bg-forest-600 px-4 font-bold text-white" @click="openCreate">+ 신규 등록</button>
    </div>
    <input v-model="keyword" type="search" placeholder="주소·이름·특이사항 검색" class="h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-[15px]" />

    <div class="flex flex-wrap gap-2">
      <button v-for="chip in areaChips" :key="chip.id" type="button" :class="chipClass(areaFilter === chip.id)" @click="areaFilter = chip.id">
        {{ chip.name }} <span class="font-normal">{{ chip.count }}</span>
      </button>
      <span class="hidden flex-1 sm:block" />
      <button v-for="chip in stateChips" :key="chip.key" type="button" :class="chipClass(stateFilter === chip.key)" @click="toggleState(chip.key)">
        {{ chip.label }} <span class="font-normal">{{ chip.count }}</span>
      </button>
    </div>

    <p v-if="loading" class="py-10 text-center text-stone-500">불러오는 중…</p>
    <p v-else-if="loadError" class="py-10 text-center font-bold text-red-700">{{ loadError }}</p>
    <p v-else-if="!areas.length" class="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">동네가 아직 없음 · Supabase areas 테이블에 먼저 동네 추가</p>

    <template v-else>
      <div class="hidden overflow-x-auto rounded-xl border border-stone-200 bg-white md:block">
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-left text-[13px] text-stone-500">
            <tr>
              <th class="px-3 py-2.5 font-medium">동네</th>
              <th class="px-3 py-2.5 font-medium">주소</th>
              <th class="px-3 py-2.5 font-medium">신청 · 고정</th>
              <th class="px-3 py-2.5 font-medium">공동현관</th>
              <th class="px-3 py-2.5 font-medium">사이즈·그릇</th>
              <th class="px-3 py-2.5 font-medium">잔여</th>
              <th class="px-3 py-2.5 font-medium">마지막 결제</th>
              <th class="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filtered" :key="c.id" :class="['border-t border-stone-100', c.remaining === 1 ? 'bg-red-50/60' : '']">
              <td class="px-3 py-3 text-stone-600">{{ areaName(c.area_id) }}</td>
              <td class="px-3 py-3">
                <b class="text-[15px]">{{ c.address }}</b>
                <div v-if="c.memo" class="text-xs text-stone-500">{{ c.memo }}</div>
                <div v-if="c.note" class="mt-1 inline-block whitespace-pre-line rounded-md bg-amber-50 px-2 py-0.5 text-[13px] text-amber-900"><b class="mr-1">특이</b>{{ c.note }}</div>
              </td>
              <td class="px-3 py-3">
                <b>{{ planLabel(c.plan) }}</b>
                <div class="text-[13px]" :class="c.fixed_days.length ? 'text-stone-800' : 'text-stone-500'">
                  {{ c.fixed_days.length ? `고정 ${fixedDaysLabel(c.fixed_days)}` : '연락 올 때만' }}
                </div>
              </td>
              <td class="px-3 py-3">{{ c.door_code || '-' }}</td>
              <td class="px-3 py-3"><CustomerTags :size="c.size" :own-bowl="c.own_bowl" /></td>
              <td class="px-3 py-3"><RemainBadge :value="c.remaining" /></td>
              <td class="px-3 py-3">{{ paidLabel(c) }}</td>
              <td class="px-3 py-3">
                <div class="flex justify-end gap-1.5">
                  <button type="button" class="h-9 whitespace-nowrap rounded-lg border border-forest-600 px-3 font-bold text-forest-700" @click="openAdd(c)">+ 횟수 추가</button>
                  <button type="button" class="h-9 rounded-lg border border-stone-300 px-3" @click="openEdit(c)">수정</button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="8" class="px-3 py-10 text-center text-stone-500">고객 없음</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-2 md:hidden">
        <div v-for="c in filtered" :key="c.id" :class="['rounded-xl border bg-white p-3', c.remaining === 1 ? 'border-red-200 bg-red-50/60' : 'border-stone-200']">
          <div class="flex items-start gap-2">
            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <b class="text-[15px]">{{ c.address }}</b>
              <span class="text-[13px] text-stone-500">
                {{ areaName(c.area_id) }}<template v-if="c.door_code"> · 공동현관 {{ c.door_code }}</template><template v-if="c.memo"> · {{ c.memo }}</template>
              </span>
              <div v-if="c.note" class="whitespace-pre-line rounded-md bg-amber-50 px-2 py-1 text-[13px] text-amber-900"><b class="mr-1">특이</b>{{ c.note }}</div>
              <div class="flex flex-wrap items-center gap-1.5">
                <CustomerTags :size="c.size" :own-bowl="c.own_bowl" />
                <span class="text-xs text-stone-600">{{ planLabel(c.plan) }} · {{ c.fixed_days.length ? `고정 ${fixedDaysLabel(c.fixed_days)}` : '연락 올 때만' }}</span>
              </div>
            </div>
            <RemainBadge :value="c.remaining" prefix="잔여 " />
          </div>
          <div class="mt-2 flex items-center gap-1.5">
            <span class="mr-auto text-xs text-stone-500">결제 {{ paidLabel(c) }}</span>
            <button type="button" class="h-9 rounded-lg border border-forest-600 px-3 text-sm font-bold text-forest-700" @click="openAdd(c)">+ 횟수 추가</button>
            <button type="button" class="h-9 rounded-lg border border-stone-300 px-3 text-sm" @click="openEdit(c)">수정</button>
          </div>
        </div>
        <p v-if="!filtered.length" class="py-10 text-center text-stone-500">고객 없음</p>
      </div>

      <p class="text-[13px] text-stone-500">· 횟수 끝난 집은 [횟수 추가]로 다시 채우면 됨 (신규 등록 X) · 그만두는 집은 0회로 그냥 두기 · 삭제는 잘못 등록한 집만</p>
    </template>

    <CustomerFormModal :open="formOpen" :customer="editing" :areas="areas" @close="formOpen = false" @saved="onSaved" />
    <AddCountModal :open="addOpen" :customer="adding" @close="addOpen = false" @saved="onSaved" />
  </div>
</template>

<script setup lang="ts">
import type { Area, Customer } from '~/utils/thistle'

type StateFilter = 'none' | 'last' | 'over' | 'empty'

const supabase = useSupabaseClient<any>()

const areas = ref<Area[]>([])
const customers = ref<Customer[]>([])
const loading = ref(true)
const loadError = ref('')

const keyword = ref('')
const areaFilter = ref('all')
const stateFilter = ref<StateFilter>('none')

const formOpen = ref(false)
const editing = ref<Customer | null>(null)
const addOpen = ref(false)
const adding = ref<Customer | null>(null)

const load = async () => {
  loading.value = true
  loadError.value = ''
  const [areaRes, customerRes] = await Promise.all([
    supabase.from('areas').select('id, name, sort_order').order('sort_order'),
    supabase.from('customers').select('*'),
  ])
  loading.value = false
  if (areaRes.error || customerRes.error) {
    loadError.value = `불러오기 실패 · ${areaRes.error?.message ?? customerRes.error?.message}`
    return
  }
  areas.value = areaRes.data as Area[]
  customers.value = customerRes.data as Customer[]
}

onMounted(load)

const areaName = (id: string) => areas.value.find((a) => a.id === id)?.name ?? '-'
const areaOrder = (id: string) => areas.value.find((a) => a.id === id)?.sort_order ?? 999

const sorted = computed(() =>
  [...customers.value].sort(
    (x, y) =>
      areaOrder(x.area_id) - areaOrder(y.area_id) ||
      (x.sort_order ?? 100000) - (y.sort_order ?? 100000) ||
      x.address.localeCompare(y.address, 'ko'),
  ),
)

const matchesState = (c: Customer) => {
  if (stateFilter.value === 'last') return c.remaining === 1
  if (stateFilter.value === 'over') return c.remaining === 0
  if (stateFilter.value === 'empty') return c.remaining === null
  return true
}

const matchesKeyword = (c: Customer) => {
  const word = keyword.value.trim()
  if (!word) return true
  return c.address.includes(word) || (c.memo ?? '').includes(word) || (c.note ?? '').includes(word)
}

const filtered = computed(() =>
  sorted.value.filter(
    (c) => (areaFilter.value === 'all' || c.area_id === areaFilter.value) && matchesState(c) && matchesKeyword(c),
  ),
)

const areaChips = computed(() => [
  { id: 'all', name: '전체', count: customers.value.length },
  ...areas.value.map((a) => ({
    id: a.id,
    name: a.name,
    count: customers.value.filter((c) => c.area_id === a.id).length,
  })),
])

const stateChips = computed(() => [
  { key: 'last' as StateFilter, label: '잔여 1회', count: customers.value.filter((c) => c.remaining === 1).length },
  { key: 'over' as StateFilter, label: '횟수 끝남', count: customers.value.filter((c) => c.remaining === 0).length },
  { key: 'empty' as StateFilter, label: '미입력', count: customers.value.filter((c) => c.remaining === null).length },
])

const toggleState = (key: StateFilter) => {
  stateFilter.value = stateFilter.value === key ? 'none' : key
}

const chipClass = (on: boolean) => [
  'h-10 rounded-full border px-4 text-sm font-bold',
  on ? 'border-forest-600 bg-forest-600 text-white' : 'border-stone-300 bg-white',
]

const paidLabel = (c: Customer) => {
  if (!c.last_paid_on) return '-'
  return `${formatMD(c.last_paid_on)}${c.pay_method ? ` · ${PAY_LABEL[c.pay_method]}` : ''}`
}

const openCreate = () => {
  editing.value = null
  formOpen.value = true
}

const openEdit = (c: Customer) => {
  editing.value = c
  formOpen.value = true
}

const openAdd = (c: Customer) => {
  adding.value = c
  addOpen.value = true
}

const onSaved = async () => {
  formOpen.value = false
  addOpen.value = false
  await load()
}
</script>
