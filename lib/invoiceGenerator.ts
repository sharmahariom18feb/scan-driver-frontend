export interface InvoiceData {
  id: string
  customerName: string
  phone: string
  pickup: string
  drop: string
  dateTime: string
  fare: number
  vehicle: string
  invoiceId: string
  driverName?: string | null
  duration?: string
  type?: string
}

export async function generateInvoiceImage(data: InvoiceData): Promise<string> {
  if (typeof window === 'undefined') return ''

  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 700
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // 1. Page Background (Light Slate)
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, 600, 700)

  // 2. Brand Text (no logo drawn, as requested)
  ctx.fillStyle = '#0a3d7a'
  ctx.font = 'bold 36px sans-serif'
  ctx.fillText('Scan Driver', 20, 52)

  // 4. Header Divider Line
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(20, 80)
  ctx.lineTo(580, 80)
  ctx.stroke()

  // 5. Customer Name (Vineeta)
  ctx.fillStyle = '#0a3d7a'
  ctx.font = 'bold 15px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(data.customerName, 565, 105)
  ctx.textAlign = 'left' // Reset

  // 6. Card Background (White)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(20, 120, 560, 450)

  // 7. Card Border
  ctx.strokeStyle = '#0e5aa7'
  ctx.lineWidth = 2
  ctx.strokeRect(20, 120, 560, 450)

  // 8. Card Header Blue Banner
  ctx.fillStyle = '#0e5aa7'
  ctx.fillRect(21, 121, 558, 48)

  // 9. White Chevron ribbon inside banner
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(35, 129)
  ctx.lineTo(195, 129)
  ctx.lineTo(210, 145)
  ctx.lineTo(195, 161)
  ctx.lineTo(35, 161)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#0e5aa7'
  ctx.font = 'bold 12px sans-serif'
  const typeLabel = data.type === 'OUTSTATION' ? 'Outstation Driver' : 'Private Driver'
  ctx.fillText(typeLabel, 48, 146)

  // 10. Booking ID in banner
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 15px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`Booking ID :  ${data.id}`, 560, 150)
  ctx.textAlign = 'left'

  // 11. Date Row
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.toLowerCase() === 'immediate') {
      const now = new Date()
      return now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    if (dateStr.includes(',')) return dateStr
    try {
      const d = new Date(dateStr)
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    } catch (e) {}
    return dateStr
  }
  const formattedDate = formatDate(data.dateTime)
  ctx.fillStyle = '#475569'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`${formattedDate}   ${formattedDate}`, 560, 200)
  ctx.textAlign = 'left'

  // 12. Table Headers
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(35, 220)
  ctx.lineTo(565, 220)
  ctx.stroke()

  ctx.fillStyle = '#64748b'
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText('Description', 40, 240)
  ctx.fillText('Unit', 260, 240)
  ctx.textAlign = 'right'
  ctx.fillText('Total', 560, 240)
  ctx.textAlign = 'left'

  ctx.beginPath()
  ctx.moveTo(35, 255)
  ctx.lineTo(565, 255)
  ctx.stroke()

  // 13. Table Data Row
  ctx.fillStyle = '#334155'
  ctx.font = 'normal 13px sans-serif'
  const desc = data.type === 'HOURLY' ? 'Package' : (data.type === 'OUTSTATION' ? 'Outstation' : 'Ride Fare')
  ctx.fillText(desc, 40, 285)
  ctx.fillText(data.duration || 'N/A', 260, 285)
  ctx.textAlign = 'right'
  ctx.fillText(`₹ ${data.fare}`, 560, 285)
  ctx.textAlign = 'left'

  // 14. Table Footer Row
  ctx.beginPath()
  ctx.moveTo(35, 315)
  ctx.lineTo(565, 315)
  ctx.stroke()

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Total Charges', 40, 340)
  ctx.textAlign = 'right'
  ctx.fillText(`₹ ${data.fare}`, 560, 340)
  ctx.textAlign = 'left'

  // 15. Advance Row
  ctx.beginPath()
  ctx.moveTo(35, 410)
  ctx.lineTo(565, 410)
  ctx.stroke()

  ctx.fillStyle = '#334155'
  ctx.font = 'normal 14px sans-serif'
  ctx.fillText('Advance', 40, 440)
  ctx.textAlign = 'right'
  ctx.fillText('₹ 0', 560, 440)
  ctx.textAlign = 'left'

  // 16. Balance Amount Row
  ctx.beginPath()
  ctx.moveTo(35, 470)
  ctx.lineTo(565, 470)
  ctx.stroke()

  ctx.fillStyle = '#0e5aa7'
  ctx.font = 'bold 15px sans-serif'
  ctx.fillText('Balance Amount', 40, 510)
  ctx.textAlign = 'right'
  ctx.fillText(`₹ ${data.fare}`, 560, 510)
  ctx.textAlign = 'left'

  // 17. Footer Text
  ctx.fillStyle = '#64748b'
  ctx.font = 'italic 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Thank you for riding with Scan Driver!', 300, 620)
  ctx.font = 'normal 11px sans-serif'
  ctx.fillText('For support, contact care@scandriver.in', 300, 640)

  return canvas.toDataURL('image/png')
}
