<template>
  <BaseModal :open="open" :title="isEdit ? '고객 수정' : '신규 등록'" :description="isEdit ? customer?.address : '별표(*)만 필수'" @close="emit('close')">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr]">
      <label class="flex flex-col gap-1.5 text-sm font-medium">
        동네 *
        <span class="relative">
          <select
            v-model="form.area_id"
            :disabled="!areas.length"
            class="h-11 w-full appearance-none rounded-lg border border-stone-300 bg-white pl-3 pr-10 text-[15px] disabled:bg-stone-100 disabled:text-stone-500"
          >
            <option v-if="!areas.length" value="">등록된 동네 없음</option>
            <option v-for="area in areas" :key="area.id" :value="area.id">{{ area.name }}</option>
          </select>
          <svg class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </span>
        <span v-if="!areas.length" class="text-xs font-normal text-red-700">동네부터 등록해야 고객 등록 가능</span>
      </label>
      <label class="flex flex-col gap-1.5 text-sm font-medium">
        주소 *
        <input v-model="form.address" type="text" class="h-11 rounded-lg border border-stone-300 px-3 text-[15px]" />
      </label>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label class="flex flex-col gap-1.5 text-sm font-medium">
        공동현관 <span class="text-xs font-normal text-stone-500">없으면 비워두기</span>
        <input v-model="form.door_code" type="text" placeholder="예: #1234*" class="h-11 rounded-lg border border-stone-300 px-3 text-[15px]" />
      </label>
      <label class="flex flex-col gap-1.5 text-sm font-medium">
        특이사항 <span class="text-xs font-normal text-stone-500">국 빼기·알레르기 등 · 리스트·워드에 표시</span>
        <input v-model="form.note" type="text" placeholder="예: 국 빼기" class="h-11 rounded-lg border border-stone-300 px-3 text-[15px]" />
      </label>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div class="flex flex-col gap-1.5 text-sm font-medium">
        사이즈 *
        <div class="grid grid-cols-2 gap-1.5">
          <button v-for="opt in sizeOptions" :key="opt.value" type="button" :class="optClass(form.size === opt.value)" @click="form.size = opt.value">{{ opt.label }}</button>
        </div>
      </div>
      <div class="flex flex-col gap-1.5 text-sm font-medium">
        그릇 *
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" :class="optClass(!form.own_bowl)" @click="form.own_bowl = false">일회용</button>
          <button type="button" :class="optClass(form.own_bowl)" @click="form.own_bowl = true">개인 그릇</button>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-1.5 text-sm font-medium">
      고정 요일 <span class="text-xs font-normal text-stone-500">횟수 차감제 손님은 선택 안 해도 됨</span>
      <div class="grid grid-cols-3 gap-1.5">
        <button v-for="day in DAYS" :key="day.key" type="button" :class="optClass(form.fixed_days.includes(day.key))" @click="toggleDay(day.key)">{{ day.label }}</button>
      </div>
    </div>

    <div class="flex flex-col gap-1.5 text-sm font-medium">
      신청{{ isEdit ? '' : ' *' }}
      <span v-if="isEdit" class="text-xs font-normal text-stone-500">바꿔도 잔여 횟수는 그대로</span>
      <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
        <button v-for="plan in PLANS" :key="plan.key" type="button" :class="optClass(form.plan === plan.key)" @click="form.plan = plan.key">
          {{ isEdit ? plan.short : plan.label }}<span v-if="!isEdit && plan.count > 1" class="block text-xs font-normal">{{ plan.count }}회</span>
        </button>
      </div>
    </div>

    <label v-if="!isEdit && form.plan === 'count'" class="flex flex-col gap-1.5 text-sm font-medium">
      결제 횟수 <span class="text-xs font-normal text-stone-500">요일 안 정하고 한 번에 결제한 횟수</span>
      <input v-model="form.count" type="number" min="1" inputmode="numeric" class="h-11 w-40 rounded-lg border border-stone-300 px-3 text-[15px]" />
    </label>

    <div class="grid grid-cols-1 gap-3" :class="isEdit ? 'sm:grid-cols-3' : 'sm:grid-cols-2'">
      <label v-if="isEdit" class="flex flex-col gap-1.5 text-sm font-medium">
        잔여 횟수
        <input v-model="form.remaining" type="number" min="0" inputmode="numeric" class="h-11 rounded-lg border border-stone-300 px-3 text-[15px]" />
      </label>
      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ isEdit ? '마지막 결제일' : '결제일' }}
        <input v-model="form.last_paid_on" type="date" class="h-11 rounded-lg border border-stone-300 px-3 text-[15px]" />
      </label>
      <div class="flex flex-col gap-1.5 text-sm font-medium">
        결제 수단
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" :class="optClass(form.pay_method === 'card')" @click="form.pay_method = 'card'">카드</button>
          <button type="button" :class="optClass(form.pay_method === 'transfer')" @click="form.pay_method = 'transfer'">계좌이체</button>
        </div>
      </div>
    </div>

    <div v-if="!isEdit" class="rounded-lg border border-forest-200 bg-forest-50 px-4 py-3 text-sm">{{ summary }}</div>
    <p v-if="errorMsg" class="text-sm font-bold text-red-700">{{ errorMsg }}</p>

    <template #footer>
      <button v-if="isEdit" type="button" class="h-11 rounded-lg border border-red-200 px-4 text-red-700" @click="confirmDelete = true">삭제</button>
      <button type="button" class="ml-auto h-11 rounded-lg border border-stone-300 px-4" @click="emit('close')">취소</button>
      <button type="button" class="h-11 rounded-lg bg-forest-600 px-5 font-bold text-white disabled:opacity-60" :disabled="saving || !areas.length" @click="save">{{ isEdit ? '저장' : '등록' }}</button>
    </template>
  </BaseModal>

  <BaseModal :open="confirmDelete" title="진짜 삭제해?" :description="`${customer?.address ?? ''}\n주소·고정 요일·잔여·결제일 전부 지워짐`" @close="confirmDelete = false">
    <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">되돌리기 불가</div>
    <template #footer>
      <button type="button" class="ml-auto h-11 rounded-lg border border-stone-300 px-4" @click="confirmDelete = false">취소</button>
      <button type="button" class="h-11 rounded-lg bg-red-700 px-5 font-bold text-white disabled:opacity-60" :disabled="saving" @click="remove">삭제</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { Area, Customer, Day, PayMethod, Plan, Size } from '~/utils/thistle'

const props = defineProps<{ open: boolean; customer: Customer | null; areas: Area[] }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const supabase = useSupabaseClient<any>()

const sizeOptions: { value: Size; label: string }[] = [
  { value: '2-3', label: '2-3인분' },
  { value: '4-5', label: '4-5인분' },
]

const isEdit = computed(() => !!props.customer)
const saving = ref(false)
const errorMsg = ref('')
const confirmDelete = ref(false)

const form = reactive({
  area_id: '',
  address: '',
  door_code: '',
  memo: '',
  note: '',
  size: '2-3' as Size,
  own_bowl: false,
  fixed_days: [] as Day[],
  plan: 'w2' as Plan | '',
  count: 12 as number | string,
  remaining: '' as string | number,
  last_paid_on: '',
  pay_method: 'card' as PayMethod,
})

const reset = () => {
  const c = props.customer
  form.area_id = c?.area_id ?? props.areas[0]?.id ?? ''
  form.address = c?.address ?? ''
  form.door_code = c?.door_code ?? ''
  form.memo = c?.memo ?? ''
  form.note = c?.note ?? ''
  form.size = c?.size ?? '2-3'
  form.own_bowl = c?.own_bowl ?? false
  form.fixed_days = c ? [...c.fixed_days] : []
  form.plan = c ? c.plan ?? '' : 'w2'
  form.count = 12
  form.remaining = c?.remaining ?? ''
  form.last_paid_on = c ? c.last_paid_on ?? '' : todayStr()
  form.pay_method = c?.pay_method ?? 'card'
  errorMsg.value = ''
  confirmDelete.value = false
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) reset()
  },
)

const optClass = (on: boolean) => [
  'min-h-11 rounded-lg border px-2 py-1.5 text-sm leading-tight',
  on ? 'border-forest-600 bg-forest-100 font-bold text-forest-800' : 'border-stone-300 bg-white',
]

const toggleDay = (day: Day) => {
  form.fixed_days = form.fixed_days.includes(day) ? form.fixed_days.filter((d) => d !== day) : [...form.fixed_days, day]
}

const planCount = computed(() => (form.plan === 'count' ? Number(form.count) || 0 : PLANS.find((p) => p.key === form.plan)?.count ?? 0))

const summary = computed(() => {
  const days = fixedDaysLabel(form.fixed_days)
  return `잔여 ${planCount.value}회로 등록` + (days ? ` · 매주 ${days} 리스트에 자동 포함` : '')
})

const save = async () => {
  if (!form.area_id || !form.address.trim()) {
    errorMsg.value = '동네·주소는 필수'
    return
  }
  if (!isEdit.value && !form.plan) {
    errorMsg.value = '신청 선택 필수'
    return
  }
  if (!isEdit.value && planCount.value < 1) {
    errorMsg.value = '결제 횟수는 1 이상'
    return
  }
  const remainingValue = form.remaining === '' || form.remaining === null ? null : Number(form.remaining)
  if (remainingValue !== null && (Number.isNaN(remainingValue) || remainingValue < 0)) {
    errorMsg.value = '잔여 횟수는 0 이상 숫자'
    return
  }

  saving.value = true
  errorMsg.value = ''
  const payload = {
    area_id: form.area_id,
    address: form.address.trim(),
    door_code: form.door_code.trim() || null,
    memo: form.memo.trim() || null,
    note: form.note.trim() || null,
    size: form.size,
    own_bowl: form.own_bowl,
    fixed_days: DAYS.map((d) => d.key).filter((key) => form.fixed_days.includes(key)),
    plan: form.plan || null,
    remaining: isEdit.value ? remainingValue : planCount.value,
    last_paid_on: form.last_paid_on || null,
    pay_method: form.last_paid_on ? form.pay_method : null,
    updated_at: new Date().toISOString(),
  }

  const { error } = isEdit.value
    ? await supabase.from('customers').update(payload).eq('id', props.customer!.id)
    : await supabase.from('customers').insert(payload)

  saving.value = false
  if (error) {
    errorMsg.value = `저장 실패 · ${error.message}`
    return
  }
  emit('saved')
}

const remove = async () => {
  if (!props.customer) return
  saving.value = true
  const { error } = await supabase.from('customers').delete().eq('id', props.customer.id)
  saving.value = false
  if (error) {
    confirmDelete.value = false
    errorMsg.value = `삭제 실패 · ${error.message}`
    return
  }
  confirmDelete.value = false
  emit('saved')
}
</script>
