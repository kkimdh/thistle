export type Size = '2-3' | '4-5'
export type PayMethod = 'card' | 'transfer'
export type Day = 'mon' | 'wed' | 'fri'

export interface Area {
  id: string
  name: string
  sort_order: number
}

export interface Customer {
  id: string
  area_id: string
  address: string
  door_code: string | null
  memo: string | null
  note: string | null
  size: Size
  own_bowl: boolean
  fixed_days: Day[]
  remaining: number | null
  last_paid_on: string | null
  pay_method: PayMethod | null
}

export const DAYS: { key: Day; label: string }[] = [
  { key: 'mon', label: '월' },
  { key: 'wed', label: '수' },
  { key: 'fri', label: '금' },
]

export const PLANS = [
  { key: 'once', label: '1회 배송', count: 1 },
  { key: 'w1', label: '주1회 4주', count: 4 },
  { key: 'w2', label: '주2회 4주', count: 8 },
  { key: 'w3', label: '주3회 4주', count: 12 },
]

export const PAY_LABEL: Record<PayMethod, string> = {
  card: '카드',
  transfer: '계좌이체',
}

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
