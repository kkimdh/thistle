<template>
  <BaseModal :open="open" title="횟수 추가" :description="description" @close="emit('close')">
    <div class="flex flex-col gap-1.5 text-sm font-medium">
      추가할 횟수
      <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <button v-for="p in PLANS" :key="p.key" type="button" :class="optClass(plan === p.key)" @click="plan = p.key">
          {{ p.label }}<span v-if="p.count > 1" class="block text-xs font-normal">{{ p.count }}회</span>
        </button>
      </div>
    </div>

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

    <div class="rounded-lg border border-forest-200 bg-forest-50 px-4 py-3">
      <p class="text-base">잔여 {{ current }}회 + {{ addCount }}회 = <b class="text-xl">{{ current + addCount }}회</b></p>
      <p v-if="restartText" class="mt-1 text-sm">{{ restartText }}</p>
    </div>
    <p class="text-xs text-stone-500">주소·사이즈·그릇·고정 요일은 그대로 · 바꾸려면 [수정]</p>
    <p v-if="errorMsg" class="text-sm font-bold text-red-700">{{ errorMsg }}</p>

    <template #footer>
      <button type="button" class="ml-auto h-11 rounded-lg border border-stone-300 px-4" @click="emit('close')">취소</button>
      <button type="button" class="h-11 rounded-lg bg-forest-600 px-5 font-bold text-white disabled:opacity-60" :disabled="saving" @click="save">횟수 추가</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { Customer, PayMethod } from '~/utils/thistle'

const props = defineProps<{ open: boolean; customer: Customer | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const supabase = useSupabaseClient<any>()

const plan = ref('w2')
const paidOn = ref(todayStr())
const payMethod = ref<PayMethod>('card')
const saving = ref(false)
const errorMsg = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    plan.value = 'w2'
    paidOn.value = todayStr()
    payMethod.value = props.customer?.pay_method ?? 'card'
    errorMsg.value = ''
  },
)

const current = computed(() => props.customer?.remaining ?? 0)
const addCount = computed(() => PLANS.find((p) => p.key === plan.value)?.count ?? 0)

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
  saving.value = true
  errorMsg.value = ''
  const { error } = await supabase
    .from('customers')
    .update({
      remaining: current.value + addCount.value,
      last_paid_on: paidOn.value || null,
      pay_method: paidOn.value ? payMethod.value : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', props.customer.id)
  saving.value = false
  if (error) {
    errorMsg.value = `저장 실패 · ${error.message}`
    return
  }
  emit('saved')
}
</script>
