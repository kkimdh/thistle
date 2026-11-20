import type { Customer } from '~/utils/thistle'

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const buildDeliveryDoc = async (items: Customer[]) => {
  const { Document, Packer, Paragraph, TextRun } = await import('docx')
  const base = { bold: true, size: 26 }

  const children = items.map((c) => {
    const runs = [new TextRun({ ...base, text: c.address })]
    if (c.size === '4-5') runs.push(new TextRun({ ...base, text: ' ' }), new TextRun({ ...base, text: '大', highlight: 'red' }))
    if (c.own_bowl) runs.push(new TextRun({ ...base, text: ' (용기)' }))
    if (c.door_code) runs.push(new TextRun({ ...base, text: ` (${c.door_code})` }))
    if (c.note) runs.push(new TextRun({ ...base, text: ` (${c.note})` }))
    return new Paragraph({ children: runs, spacing: { after: 160 } })
  })

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Malgun Gothic', size: 22 } } } },
    sections: [
      {
        properties: {
          page: { margin: { top: 1701, bottom: 1440, left: 1440, right: 1440 } },
          column: { count: 2, space: 425, equalWidth: true },
        },
        children,
      },
    ],
  })
  return Packer.toBlob(doc)
}
