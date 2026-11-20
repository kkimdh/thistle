<template>
  <BaseModal :open="open" title="횟수 추가" @close="emit('close')">
    <template #description>
      <div v-if="customer" class="mt-2 flex flex-col gap-1.5">
        <b class="text-base text-stone-900">{{ customer.address }}</b>
        <div class="flex flex-wrap items-center gap-1.5 text-sm text-stone-600">
          <CustomerTags :size="customer.size" :own-bowl="customer.own_bowl" />
          <span v-if="customer.fixed_days.length">고정 {{ fixedDaysLabel(customer.fixed_days) }}</span>
          <span>· 현재 잔여</span>
          <RemainBadge :value="customer.remaining ?? 0" />
        </div>
      </div>
    </template>
    <div class="grid grid-cols-2 gap-1.5">
      <button type="button" :class="optClass(!isService)" @click="isService = false">결제함</button>
      <button type="button" :class="optClass(isService)" @click="isService = true">서비스 (결제 없음)</button>
    </div>

    <template v-if="!isService">
      <div class="flex flex-col gap-1.5 text-sm font-medium">
        추가할 횟수
        <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
          <button v-for="p in PLANS" :key="p.key" type="button" :class="optClass(plan === p.key)" @click="plan = p.key">
            {{ p.label }}<span v-if="p.count > 1" class="block text-xs font-normal">{{ p.count }}회</span>
          </button>
        </div>
      </div>

      <label v-if="plan === 'count'" class="flex flex-col gap-1.5 text-sm font-medium">
        결제 횟수
        <input v-model="customCount" type="number" min="1" inputmode="numeric" class="h-11 w-40 rounded-lg border border-stone-300 px-3 text-[15px]" />
      </label>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label class="flex flex-col gap-1.5 text-sm font-medium">
          결제일
          <input v-model="paidOn" type="date" class="h-11 rounded-lg border border-stone-300 px-3 text-[15px]" />
        </label>
        <div class="flex flex-col gap-1.5 text-sm font-medium">
          결제 수단
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" :class="optClass(payMethod === 'card')" @click="payMethod = 'card'">카드</button>
            <button type="button" :class="optClass(payMethod === 'transfer')" @click="payMethod = 'transfer'">계좌이체</button>
          </div>
        </div>
      </div>
    </template>

    <label v-else class="flex flex-col gap-1.5 text-sm font-medium">
      추가할 횟수 <span class="text-xs font-normal text-stone-500">마지막 결제일·신청은 그대로</span>
      <input v-model="serviceCount" type="number" min="1" inputmode="numeric" class="h-11 w-40 rounded-lg border border-stone-300 px-3 text-[15px]" />
    </label>

    <div class="rounded-lg border border-forest-200 bg-forest-50 px-4 py-3">
      <p class="text-base">잔여 {{ current }}회 + {{ addCount }}회 = <b class="text-xl">{{ current + addCount }}회</b></p>
      <p v-if="restartText" class="mt-1 text-sm">{{ restartText }}</p>
    </div>
    <p class="text-xs text-stone-500">{{ isService ? '서비스는 잔여만 늘어남' : '고른 신청이 고객 정보에 저장됨' }} · 주소·사이즈·그릇·고정 요일은 그대로</p>
    <p v-if="errorMsg" class="text-sm font-bold text-red-700">{{ errorMsg }}</p>

    <template #footer>
      <button type="button" class="ml-auto h-11 rounded-lg border border-stone-300 px-4" @click="emit('close')">취소</button>
      <button type="button" class="h-11 rounded-lg bg-forest-600 px-5 font-bold text-white disabled:opacity-60" :disabled="saving" @click="save">횟수 추가</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { Customer, PayMethod, Plan } from '~/utils/thistle'

const props = defineProps<{ open: boolean; customer: Customer | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const supabase = useSupabaseClient<any>()

const isService = ref(false)
const plan = ref<Plan>('w2')
const customCount = ref<number | string>(12)
const serviceCount = ref<number | string>(1)
const paidOn = ref(todayStr())
const payMethod = ref<PayMethod>('card')
const saving = ref(false)
const errorMsg = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    isService.value = false
    plan.value = props.customer?.plan ?? 'w2'
    customCount.value = 12
    serviceCount.value = 1
    paidOn.value = todayStr()
    payMethod.value = props.customer?.pay_method ?? 'card'
    errorMsg.value = ''
  },
)

const current = computed(() => props.customer?.remaining ?? 0)

const addCount = computed(() => {
  if (isService.value) return Number(serviceCount.value) || 0
  if (plan.value === 'count') return Number(customCount.value) || 0
  return PLANS.find((p) => p.key === plan.value)?.count ?? 0
})

const description = computed(() => {
  const c = props.customer
  if (!c) return ''
  const days = fixedDaysLabel(c.fixed_days)
  const size = c.size === '4-5' ? '4-5인분' : '2-3인분'
  return `${c.address} · ${size}${days ? ` · 고정 ${days}` : ''}\n현재 잔여 ${c.remaining ?? 0}회`
})

const restartText = computed(() => {
  const c = props.customer
  if (!c || (c.remaining ?? 0) > 0 || !c.fixed_days.length) return ''
  return `다음 고정 요일(${fixedDaysLabel(c.fixed_days)})부터 다시 리스트에 자동 포함`
})

const optClass = (on: boolean) => [
  'min-h-11 rounded-lg border px-2 py-1.5 text-sm leading-tight',
  on ? 'border-forest-600 bg-forest-100 font-bold text-forest-800' : 'border-stone-300 bg-white',
]

const save = async () => {
  if (!props.customer) return
  if (addCount.value < 1) {
    errorMsg.value = '추가할 횟수는 1 이상'
    return
  }
  saving.value = true
  errorMsg.value = ''

  const payload: Record<string, unknown> = {
    remaining: current.value + addCount.value,
    updated_at: new Date().toISOString(),
  }
  if (!isService.value) {
    payload.plan = plan.value
    payload.last_paid_on = paidOn.value || null
    payload.pay_method = paidOn.value ? payMethod.value : null
  }

  const { error } = await supabase.from('customers').update(payload).eq('id', props.customer.id)
  saving.value = false
  if (error) {
    errorMsg.value = `저장 실패 · ${error.message}`
    return
  }
  emit('saved')
}
</script>
