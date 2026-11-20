import type { Area, Customer } from '~/utils/thistle'

export const sortCustomers = (areas: Area[], customers: Customer[]) => {
  const order = (id: string) => areas.find((a) => a.id === id)?.sort_order ?? 999
  return [...customers].sort(
    (x, y) =>
      order(x.area_id) - order(y.area_id) ||
      (x.sort_order ?? 100000) - (y.sort_order ?? 100000) ||
      x.address.localeCompare(y.address, 'ko'),
  )
}

export const buildBackupWorkbook = async (areas: Area[], customers: Customer[]) => {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  const sorted = sortCustomers(areas, customers)
  const areaName = (id: string) => areas.find((a) => a.id === id)?.name ?? '-'

  const columns = [
    { header: '동네', key: 'area', width: 10 },
    { header: '주소', key: 'address', width: 34 },
    { header: '공동현관', key: 'door', width: 12 },
    { header: '잔여 횟수', key: 'remaining', width: 10 },
    { header: '사이즈', key: 'size', width: 9 },
    { header: '그릇', key: 'bowl', width: 10 },
    { header: '신청', key: 'plan', width: 9 },
    { header: '고정 요일', key: 'fixed', width: 10 },
    { header: '특이사항', key: 'note', width: 30 },
    { header: '마지막 결제일', key: 'paid', width: 13 },
    { header: '결제 수단', key: 'pay', width: 10 },
  ]

  const toRow = (c: Customer) => ({
    area: areaName(c.area_id),
    address: c.address,
    door: c.door_code ?? '-',
    remaining: c.remaining ?? '미입력',
    size: c.size === '4-5' ? '4-5인분' : '2-3인분',
    bowl: c.own_bowl ? '개인 그릇' : '일회용',
    plan: planLabel(c.plan),
    fixed: fixedDaysLabel(c.fixed_days) || '-',
    note: c.note ?? '',
    paid: c.last_paid_on ?? '-',
    pay: c.pay_method ? PAY_LABEL[c.pay_method] : '-',
  })

  const addSheet = (name: string, list: Customer[], withArea: boolean) => {
    const ws = wb.addWorksheet(name)
    ws.columns = withArea ? columns : columns.slice(1)
    list.forEach((c) => {
      const row = ws.addRow(toRow(c))
      if (c.remaining === 1) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDECEA' } }
          cell.font = { bold: true, color: { argb: 'FFB42318' } }
        })
      }
    })
    const header = ws.getRow(1)
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    header.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A2E' } }
    })
    ws.views = [{ state: 'frozen', ySplit: 1 }]
  }

  areas.forEach((a) => addSheet(a.name, sorted.filter((c) => c.area_id === a.id), false))
  addSheet('전체', sorted, true)

  const buffer = await wb.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
