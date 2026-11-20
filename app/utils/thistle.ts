export type Size = '2-3' | '4-5'
export type PayMethod = 'card' | 'transfer'
export type Day = 'mon' | 'wed' | 'fri'
export type Plan = 'once' | 'w1' | 'w2' | 'w3' | 'count'

export interface Area {
  id: string
  name: string
  sort_order: number
}

export interface Customer {
  id: string
  area_id: string
  sort_order: number | null
  address: string
  door_code: string | null
  memo: string | null
  note: string | null
  size: Size
  own_bowl: boolean
  fixed_days: Day[]
  plan: Plan | null
  remaining: number | null
  last_paid_on: string | null
  pay_method: PayMethod | null
}

export const DAYS: { key: Day; label: string }[] = [
  { key: 'mon', label: '월' },
  { key: 'wed', label: '수' },
  { key: 'fri', label: '금' },
]

export const PLANS: { key: Plan; label: string; short: string; count: number }[] = [
  { key: 'once', label: '1회 배송', short: '1회 배송', count: 1 },
  { key: 'w1', label: '주1회 4주', short: '주1회', count: 4 },
  { key: 'w2', label: '주2회 4주', short: '주2회', count: 8 },
  { key: 'w3', label: '주3회 4주', short: '주3회', count: 12 },
  { key: 'count', label: '횟수제', short: '횟수제', count: 0 },
]

export const PAY_LABEL: Record<PayMethod, string> = {
  card: '카드',
  transfer: '계좌이체',
}

export const planLabel = (plan: Plan | null) => PLANS.find((p) => p.key === plan)?.short ?? '-'

export const todayStr = () => {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export const formatMD = (date: string | null) => {
  if (!date) return '-'
  const [, m, d] = date.split('-')
  return `${m}/${d}`
}

export const fixedDaysLabel = (days: Day[]) =>
  DAYS.filter((d) => days.includes(d.key))
    .map((d) => d.label)
    .join('·')

export interface Delivery {
  id: string
  customer_id: string
  delivery_date: string
  kind: 'request' | 'fixed'
  status: 'planned' | 'skipped' | 'done'
}

export interface Holiday {
  day: string
  reason: string | null
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const WEEKDAY_KEYS: Record<number, Day> = { 1: 'mon', 3: 'wed', 5: 'fri' }

export const toDateStr = (d: Date) => {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export const fromDateStr = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

export const addDays = (s: string, n: number) => {
  const d = fromDateStr(s)
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

export const weekdayKey = (s: string): Day | null => WEEKDAY_KEYS[fromDateStr(s).getDay()] ?? null

export const dateLabel = (s: string) => `${formatMD(s)} (${WEEKDAY_LABELS[fromDateStr(s).getDay()]})`

export const mondayOf = (s: string) => {
  const d = fromDateStr(s)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return toDateStr(d)
}

export const weekDeliveryDates = (monday: string) => [monday, addDays(monday, 2), addDays(monday, 4)]

export const nextDeliveryDate = (s: string) => {
  let d = s
  while (!weekdayKey(d)) d = addDays(d, 1)
  return d
}
