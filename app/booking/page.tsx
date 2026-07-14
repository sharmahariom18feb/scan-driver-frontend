'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { supabase } from '@/lib/supabaseClient'
import {
  Compass,
  AlertCircle,
  HelpCircle,
  MessageSquare,
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { WHATSAPP_CUSTOMER, getWhatsAppLink } from '@/constants'
import { cn } from '@/lib/utils'
import { Rajdhani, Nunito } from 'next/font/google'

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-rajdhani',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-nunito',
})

type TripType = 'oneway' | 'roundtrip' | 'monthly' | 'outstation'
type CarType = 'hatchback' | 'sedan' | 'suv' | 'luxury'
type OutstationType = 'oneway' | 'roundtrip'

/* ─── Defaults — minimum 1 hour from now ─── */
function getMinDateTime() {
  const now = new Date()
  now.setHours(now.getHours() + 1)
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}`, full: now }
}

export default function BookingPage() {
  // Core States
  const [customerName, setCustomerName] = useState('')
  const [phoneVal, setPhoneVal] = useState('')
  const [emailVal, setEmailVal] = useState('')
  const [tripType, setTripType] = useState<TripType>('oneway')
  const [carType, setCarType] = useState<CarType | ''>('')

  // Date & Time states
  const [bookDate, setBookDate] = useState('')
  const [bookTime, setBookTime] = useState('')
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('')

  // Specific trip fields
  // 1. One Way
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [estKms, setEstKms] = useState<number>(0)

  // 2. Round Trip
  const [roundHours, setRoundHours] = useState<number>(0)

  // 3. Monthly
  const [monthlyDays, setMonthlyDays] = useState<number>(0)
  const [monthlyHours, setMonthlyHours] = useState<number>(0)
  const [extraAmt, setExtraAmt] = useState<number>(0)

  // 4. Outstation
  const [outSubType, setOutSubType] = useState<OutstationType>('oneway')
  const [outPickup, setOutPickup] = useState('')
  const [outDrop, setOutDrop] = useState('')
  const [outKms, setOutKms] = useState<number>(0)
  const [outDest, setOutDest] = useState('')
  const [outDays, setOutDays] = useState<number>(0)

  // Common Pickup for RT & Monthly
  const [pickupCommon, setPickupCommon] = useState('')

  // Comments
  const [comments, setComments] = useState('')

  // Geolocation
  const [userLat, setUserLat] = useState('')
  const [userLng, setUserLng] = useState('')
  const [locationCaptured, setLocationCaptured] = useState(false)
  const [capturingLocation, setCapturingLocation] = useState(false)

  // Submit and Validation States
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize dates
  useEffect(() => {
    const { date, time } = getMinDateTime()
    setBookDate(date)
    setBookTime(time)
    setInterviewDate(date)
    setInterviewTime(time)
  }, [])

  // Check URL params for quick pre-filling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const serviceParam = params.get('service')?.toLowerCase() || params.get('type')?.toLowerCase()
      if (serviceParam) {
        if (['oneway', 'roundtrip', 'monthly', 'outstation'].includes(serviceParam)) {
          setTripType(serviceParam as TripType)
        } else if (serviceParam === 'hourly') {
          setTripType('roundtrip') // Hourly driver maps to Local Round Trip
        } else if (serviceParam === 'weekly') {
          setTripType('monthly') // Maps to monthly with custom duration
        }
      }
    }
  }, [])

  // Enforce 1hr minimum on date/time selection change
  const handleDateTimeChange = (dateVal: string, timeVal: string, type: 'book' | 'interview') => {
    if (!dateVal || !timeVal) return
    const { date: minDate, time: minTime, full: minDT } = getMinDateTime()
    const selectedDT = new Date(`${dateVal}T${timeVal}`)
    if (selectedDT < minDT) {
      toast.warning('⚠️ Booking must be at least 1 hour from now.')
      if (type === 'book') {
        setBookDate(minDate)
        setBookTime(minTime)
      } else {
        setInterviewDate(minDate)
        setInterviewTime(minTime)
      }
    } else {
      if (type === 'book') {
        setBookDate(dateVal)
        setBookTime(timeVal)
      } else {
        setInterviewDate(dateVal)
        setInterviewTime(timeVal)
      }
    }
  }

  // Geolocation capture handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device')
      return
    }
    setCapturingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5)
        const lng = pos.coords.longitude.toFixed(5)
        setUserLat(lat)
        setUserLng(lng)
        setLocationCaptured(true)
        setCapturingLocation(false)
        toast.success('📍 Live Location Captured!')
      },
      () => {
        setCapturingLocation(false)
        toast.error('Location access denied. Please type your location manually.')
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Pricing engine definitions
  const oneWayPrices: Record<number, number> = {
    10: 299, 15: 349, 20: 399, 25: 439, 30: 479, 35: 519,
    40: 559, 45: 599, 50: 639, 55: 679, 60: 719, 65: 759, 70: 799
  }
  const roundTripPrices: Record<number, number> = {
    2: 199, 3: 299, 4: 399, 5: 499, 6: 599, 7: 699,
    8: 799, 9: 899, 10: 999, 11: 1099, 12: 1199
  }

  const getOneWayPrice = (km: number) => {
    const slabs = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]
    if (km > 70) return 799 + Math.round((km - 70) * 10)
    for (let i = slabs.length - 1; i >= 0; i--) {
      if (km >= slabs[i]) return oneWayPrices[slabs[i]]
    }
    return null
  }

  const getRoundTripPrice = (hrs: number) => {
    if (hrs < 2) return null
    if (hrs > 12) return 1199 + (hrs - 12) * 100
    return roundTripPrices[hrs] || null
  }

  const getOutstationOWPrice = (km: number) => {
    const outstationOWPrices: Record<number, number> = {
      100: 1050, 150: 1299, 200: 1499, 250: 1699, 300: 1899, 350: 2099, 400: 2299
    }
    if (outstationOWPrices[km] !== undefined) {
      return outstationOWPrices[km]
    }
    // Fallback logic for values between slabs
    const slabs = [100, 150, 200, 250, 300, 350, 400]
    if (km < 100) return 1050
    if (km > 400) return 2299 + Math.round((km - 400) * 10)
    for (let i = slabs.length - 1; i >= 0; i--) {
      if (km >= slabs[i]) return outstationOWPrices[slabs[i]]
    }
    return 1050
  }

  const calcMonthlyPriceVal = (days: number, hours: number) => {
    const mLookup: Record<string, number> = {
      '22-8': 18000, '22-10': 20000, '22-12': 22000,
      '24-8': 20000, '24-10': 22000, '24-12': 24000,
      '26-8': 22000, '26-10': 24000, '26-12': 26000
    }
    const key = `${days}-${hours}`
    if (mLookup[key]) {
      return { amount: mLookup[key], isExact: true }
    } else {
      const basePerUnit = 24000 / (26 * 10)
      const raw = Math.round(days * hours * basePerUnit)
      return { amount: Math.max(raw, 18000), isExact: false }
    }
  }

  // Calculate pricing state dynamically
  const calcPrice = () => {
    let amount: number | null = null
    let note = ''

    if (tripType === 'roundtrip') {
      if (roundHours > 0) {
        if (roundHours < 2) {
          note = '⚠️ Minimum booking is 2 hours'
        } else {
          amount = getRoundTripPrice(roundHours)
          note = roundHours > 12
            ? '₹1,199 + ₹100 per extra hour · ₹2.5/min if time exceeded'
            : '₹2.5/min if time exceeded'
        }
      }
    } else if (tripType === 'oneway') {
      if (estKms > 0) {
        if (estKms < 10) {
          note = '⚠️ Minimum one-way distance is 10 km'
        } else {
          amount = getOneWayPrice(estKms)
          note = estKms > 70
            ? '₹10/km extra beyond 70 km'
            : '₹10/km extra if KM exceeded'
        }
      }
    } else if (tripType === 'outstation') {
      if (outSubType === 'oneway') {
        if (outKms > 0) {
          if (outKms < 50) {
            note = '⚠️ Outstation minimum distance is 50 km'
          } else {
            amount = getOutstationOWPrice(outKms)
            note = 'Outstation one-way · ₹10/km if distance exceeded'
          }
        }
      } else {
        if (outDays > 0) {
          const outRTprices: Record<number, number> = {
            1: 1199, 2: 2299, 3: 3399, 4: 4499, 5: 5599, 6: 6699, 7: 7799
          }
          amount = outRTprices[outDays] || (outDays * 1100 + 99)
          note = `${outDays} day${outDays > 1 ? 's' : ''} · Max 12 hrs/day · ₹2/min if time exceeded`
        }
      }
    } else if (tripType === 'monthly') {
      if (monthlyDays > 0 && monthlyHours > 0) {
        const res = calcMonthlyPriceVal(monthlyDays, monthlyHours)
        amount = res.amount + (extraAmt || 0)
        note = 'Minimum salary · Final decided at interview'
      }
    }
    return { amount, note }
  }

  const getNightCharge = () => {
    if (tripType === 'monthly' || !bookTime) return 0
    const [h] = bookTime.split(':').map(Number)
    if (h >= 22 || h < 6) return 200
    return 0
  }

  const { amount, note } = calcPrice()
  const nightCharge = getNightCharge()
  const totalFare = amount ? amount + nightCharge : null

  // Date Formatting for Summary Preview
  const getNiceDateTime = () => {
    const isM = tripType === 'monthly'
    const dStr = isM ? interviewDate : bookDate
    const tStr = isM ? interviewTime : bookTime
    if (!dStr || !tStr) return '—'

    try {
      const o = new Date(`${dStr}T${tStr}`)
      const dN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const mN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${dN[o.getDay()]}, ${o.getDate()} ${mN[o.getMonth()]} · ${o.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
    } catch {
      return '—'
    }
  }

  // Google Calendar Integration URL
  const getGoogleCalendarUrl = () => {
    if (!interviewDate || !interviewTime) return '#'
    try {
      const d = new Date(`${interviewDate}T${interviewTime}`)
      const dEnd = new Date(d.getTime() + 60 * 60 * 1000) // +1 hour
      const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, '').split('.')[0]
      const start = fmt(d)
      const end = fmt(dEnd)

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=ScanDriver+Driver+Interview&dates=${start}/${end}&details=Driver+interview+scheduled+via+ScanDriver.in/booking&location=As+shared+on+WhatsApp`
    } catch {
      return '#'
    }
  }

  // Validation
  const validateForm = () => {
    const e: Record<string, string> = {}
    if (!customerName.trim()) e.custName = 'Please enter your name'
    if (!phoneVal.trim()) {
      e.custPhone = 'Please enter a valid 10-digit number'
    } else if (phoneVal.length !== 10 || isNaN(Number(phoneVal))) {
      e.custPhone = 'Please enter a valid 10-digit number'
    }
    if (!carType) e.carType = 'Please select a car type'

    if (tripType === 'oneway') {
      if (!pickup.trim()) e.pickup = 'Please enter pickup location'
      if (!drop.trim()) e.drop = 'Please enter drop location'
      if (!estKms) e.estKms = 'Please select estimated KMs'
    }

    if (tripType === 'roundtrip') {
      if (!roundHours || roundHours < 2) e.roundHours = 'Minimum 2 hours required'
      if (!pickupCommon.trim()) e.pickupCommon = 'Please enter pickup location'
    }

    if (tripType === 'monthly') {
      if (!interviewDate) e.interviewDate = 'Please select interview date'
      if (!interviewTime) e.interviewTime = 'Please select preferred time'
      if (!monthlyDays || monthlyDays <= 0) e.monthlyDays = 'Please enter working days'
      if (!monthlyHours || monthlyHours <= 0) e.monthlyHours = 'Please enter hours per day'
      if (!pickupCommon.trim()) e.pickupCommon = 'Please enter pickup location'
    }

    if (tripType === 'outstation') {
      if (!outPickup.trim()) e.outPickup = 'Please enter pickup location'
      if (outSubType === 'oneway') {
        if (!outDrop.trim()) e.outDrop = 'Please enter drop location'
        if (!outKms) e.outKms = 'Please select estimated KMs'
      } else {
        if (!outDest.trim()) e.outDest = 'Please enter destination'
        if (!outDays || outDays <= 0) e.outDays = 'Please enter number of days'
      }
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Booking Submit
  const handleBookingSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting.')
      const firstErrorEl = document.querySelector('.error')
      if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    const bookingId = 'SD-' + Math.floor(1000 + Math.random() * 9000)

    // Build pickup address with location coordinates if captured
    let finalPickup = ''
    if (tripType === 'oneway') finalPickup = pickup
    else if (tripType === 'roundtrip' || tripType === 'monthly') finalPickup = pickupCommon
    else finalPickup = outPickup

    if (locationCaptured && userLat && userLng) {
      finalPickup += ` (GPS: https://www.google.com/maps?q=${userLat},${userLng})`
    }

    // Drop
    let finalDrop = ''
    if (tripType === 'oneway') finalDrop = drop
    else if (tripType === 'roundtrip') finalDrop = 'Local Trip'
    else if (tripType === 'monthly') finalDrop = 'Monthly Hire'
    else if (outSubType === 'oneway') finalDrop = outDrop
    else finalDrop = outDest

    // Date Time
    const finalDateTime = tripType === 'monthly'
      ? `Interview: ${interviewDate} ${interviewTime}`
      : `${bookDate} ${bookTime}`

    // Duration
    let finalDuration = ''
    if (tripType === 'oneway') finalDuration = 'One Way'
    else if (tripType === 'roundtrip') finalDuration = `${roundHours} Hours`
    else if (tripType === 'monthly') finalDuration = `${monthlyDays} Days x ${monthlyHours} hrs/day`
    else if (outSubType === 'oneway') finalDuration = 'One Way'
    else finalDuration = `${outDays} Days`

    // Distance
    let finalDistance = 'N/A'
    if (tripType === 'oneway') finalDistance = `${estKms} km`
    else if (tripType === 'outstation' && outSubType === 'oneway') finalDistance = `${outKms} km`

    // Type mapping to Database check constraints
    const mappedType = tripType === 'oneway' || tripType === 'roundtrip'
      ? 'HOURLY'
      : tripType === 'monthly'
        ? 'MONTHLY'
        : 'OUTSTATION'

    const dbPayload = {
      id: bookingId,
      customer_name: customerName,
      phone: phoneVal,
      pickup: finalPickup,
      drop: finalDrop,
      date_time: finalDateTime,
      duration: finalDuration,
      distance: finalDistance,
      fare: totalFare || 0,
      vehicle: carType.charAt(0).toUpperCase() + carType.slice(1),
      special_instructions: comments + (emailVal ? ` | Email: ${emailVal}` : ''),
      status: 'available' as const,
      type: mappedType,
      admin_approved: false,
    }

    try {
      const { error } = await supabase.from('bookings').insert(dbPayload)
      if (error) throw error
      toast.success('Booking recorded! Opening WhatsApp…')
    } catch (err: any) {
      console.error('Supabase save error:', err)
      toast.info('Saved locally. Redirecting to WhatsApp…')
    }

    // ── Build WhatsApp Message ──
    const carLabels = { hatchback: 'Hatchback', sedan: 'Sedan', suv: 'SUV', luxury: 'Luxury' }
    let dtStr = ''
    let tripDetails = ''
    let pickupLine = ''

    if (tripType === 'monthly') {
      try {
        const o = new Date(`${interviewDate}T${interviewTime}`)
        const dN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const mN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        dtStr = `📅 *Interview Date:* _${dN[o.getDay()]}, ${o.getDate()} ${mN[o.getMonth()]} ${o.getFullYear()}_\n🕐 *Time:* _${o.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}_`
      } catch {
        dtStr = `📅 *Interview Date:* _${interviewDate}_\n🕐 *Time:* _${interviewTime}_`
      }

      const extraLine = extraAmt > 0 ? `\n➕ *Extra Amount:* ₹${extraAmt.toLocaleString('en-IN')}` : ''
      tripDetails = `📦 *Package:* ${monthlyDays} Days × ${monthlyHours} hrs/day${extraLine}\n💰 *Minimum Salary:* ₹${(amount || 0).toLocaleString('en-IN')}`
      pickupLine = `📍 *Pickup Area:* ${pickupCommon}`
    } else {
      try {
        const o = new Date(`${bookDate}T${bookTime}`)
        const dN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const mN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        dtStr = `📅 *Date:* _${dN[o.getDay()]}, ${o.getDate()} ${mN[o.getMonth()]} ${o.getFullYear()}_\n🕐 *Time:* _${o.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}_`
      } catch {
        dtStr = `📅 *Date:* _${bookDate}_\n🕐 *Time:* _${bookTime}_`
      }
    }

    if (tripType === 'oneway') {
      tripDetails = `🏁 *Drop:* ${drop}\n📏 *Est. KMs:* ${estKms} km`
      pickupLine = `📍 *Pickup:* ${pickup}`
    } else if (tripType === 'roundtrip') {
      tripDetails = `⏱ *Hours Required:* ${roundHours} hrs`
      pickupLine = `📍 *Pickup:* ${pickupCommon}`
    } else if (tripType === 'outstation') {
      if (outSubType === 'oneway') {
        tripDetails = `🛣️ *Outstation One Way*\n🏁 *Drop City:* ${outDrop}\n📏 *Est. KMs:* ${outKms} km`
        pickupLine = `📍 *Pickup:* ${outPickup}`
      } else {
        tripDetails = `🛣️ *Outstation Round Trip*\n🏙 *Destination:* ${outDest}\n📅 *Days:* ${outDays} day${outDays > 1 ? 's' : ''}`
        pickupLine = `📍 *Pickup:* ${outPickup}`
      }
    }

    const nightLine = nightCharge > 0 ? '\n🌙 *Night Charges (NTA):* ₹200 (10PM–6AM)' : ''
    const priceStr = tripType !== 'monthly' && totalFare
      ? `\n💰 *Estimated Fare:* ₹${totalFare.toLocaleString('en-IN')}${nightLine}`
      : ''

    const commentsStr = comments.trim() ? `\n📝 *Additional Comments:* ${comments.trim()}` : ''
    const gpsStr = locationCaptured && userLat && userLng
      ? `\n📍 *My Pickup Location:* https://www.google.com/maps?q=${userLat},${userLng}`
      : ''

    const tripLabel = tripType === 'outstation'
      ? (outSubType === 'oneway' ? 'Outstation – One Way' : 'Outstation – Round Trip')
      : { oneway: 'One Way', roundtrip: 'Round Trip', monthly: 'Monthly' }[tripType]

    const msg = `🚗 *New Driver Booking – ScanDriver*

👤 *Name:* ${customerName}
📱 *Phone:* +91 ${phoneVal}

🔄 *Trip Type:* ${tripLabel}
🚙 *Car Type:* ${carLabels[carType as CarType]}
${tripDetails}${priceStr}

━━━━━━━━━━━━━━━
${dtStr}
${pickupLine}
━━━━━━━━━━━━━━━
${commentsStr}${gpsStr}

✅ Please confirm my booking. Thank you!`

    setTimeout(() => {
      window.open(getWhatsAppLink(WHATSAPP_CUSTOMER, msg), '_blank')
      setSubmitting(false)
      // Reset form fields
      setCustomerName('')
      setPhoneVal('')
      setEmailVal('')
      setPickup('')
      setDrop('')
      setEstKms(0)
      setRoundHours(0)
      setMonthlyDays(0)
      setMonthlyHours(0)
      setExtraAmt(0)
      setOutPickup('')
      setOutDrop('')
      setOutKms(0)
      setOutDest('')
      setOutDays(0)
      setPickupCommon('')
      setComments('')
      setUserLat('')
      setUserLng('')
      setLocationCaptured(false)
    }, 800)
  }

  return (
    <div className={`${rajdhani.variable} ${nunito.variable} flex flex-col min-h-screen bg-background`}>
      <Toaster position="top-center" richColors />
      <Navbar />

      <div className="booking-page-root flex-1">
        <style dangerouslySetInnerHTML={{
          __html: `
          .booking-page-root {
          --bg: #f5f7fa;
          --white: #ffffff;
          --surface: #eef1f7;
          --accent: #25D366;
          --accent-dark: #128C7E;
          --gold: #f5b800;
          --text: #1a1f36;
          --muted: #8892aa;
          --border: #dde3ef;
          --error: #ef4444;
          --outstation: #7c3aed;
          --shadow: 0 4px 24px rgba(26,31,54,0.08);
          --shadow-lg: 0 12px 40px rgba(26,31,54,0.14);
          
          font-family: var(--font-nunito), "Nunito", sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          padding-bottom: 60px;
        }

        .booking-page-root * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* HERO */
        .booking-page-root .hero {
          background: linear-gradient(135deg, #1a1f36 0%, #0f1523 60%, #152a20 100%);
          padding: 130px 20px 60px;
          position: relative;
          overflow: hidden;
        }
        
        .booking-page-root .hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(37,211,102,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(37,211,102,0.06) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        
        .booking-page-root .hero::after {
          content: "";
          position: absolute;
          bottom: -30px;
          left: 0;
          right: 0;
          height: 60px;
          background: var(--bg);
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
        }
        
        .booking-page-root .hero-inner {
          position: relative;
          z-index: 1;
          max-width: 480px;
          margin: 0 auto;
        }

        /* LOGO — bigger, left-aligned */
        .booking-page-root .hero-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .booking-page-root .logo-text-mark {
          display: flex;
          align-items: center;
        }
        
        .booking-page-root .ltm-scan {
          font-family: var(--font-rajdhani), "Rajdhani", sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 1px;
        }
        
        .booking-page-root .ltm-driver {
          font-family: var(--font-rajdhani), "Rajdhani", sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: #f5b800;
          letter-spacing: 1px;
        }
        
        .booking-page-root .logo-img {
          height: 50px;
          width: auto;
          object-fit: contain;
          display: block;
          mix-blend-mode: luminosity;
          filter: brightness(1.15) saturate(1.2);
        }
        
        .booking-page-root .contact-btn {
          background: linear-gradient(135deg, #f5b800, #e09000);
          color: #1a1f36;
          border: none;
          border-radius: 50px;
          padding: 10px 18px;
          font-family: var(--font-rajdhani), "Rajdhani", sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(245,184,0,0.4);
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .booking-page-root .contact-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245,184,0,0.5);
        }

        .booking-page-root .hero h1 {
          color: white;
          font-size: 26px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 6px;
          text-align: left;
        }
        
        .booking-page-root .hero h1 em {
          color: var(--accent);
          font-style: normal;
        }
        
        .booking-page-root .hero p {
          color: rgba(255, 255, 255, 0.55);
          font-size: 13px;
          text-align: left;
        }
        
        .booking-page-root .trust-badges {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        
        .booking-page-root .badge {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 50px;
          padding: 4px 11px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .booking-page-root .badge em {
          color: var(--accent);
          font-style: normal;
          font-weight: 600;
        }

        /* FORM WRAP */
        .booking-page-root .form-wrap {
          max-width: 480px;
          margin: -10px auto 100px;
          padding: 0 16px;
          position: relative;
          z-index: 2;
          width: 100%;
        }
        
        .booking-page-root .form-card {
          background: var(--white);
          border-radius: 20px;
          padding: 24px 20px;
          box-shadow: var(--shadow-lg);
          animation: riseUp 0.5s ease;
        }
        
        @keyframes riseUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .booking-page-root .form-title {
          font-family: var(--font-rajdhani), "Rajdhani", sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .booking-page-root .form-title::after {
          content: "";
          flex: 1;
          height: 2px;
          background: linear-gradient(to right, var(--accent), transparent);
          border-radius: 2px;
        }

        .booking-page-root .field {
          margin-bottom: 16px;
        }
        
        .booking-page-root label {
          display: block;
          font-size: 13px;
          font-weight: 800;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          text-align: left;
        }

        .booking-page-root input[type="text"],
        .booking-page-root input[type="tel"],
        .booking-page-root input[type="date"],
        .booking-page-root input[type="time"],
        .booking-page-root input[type="number"],
        .booking-page-root select,
        .booking-page-root textarea {
          width: 100%;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 13px 16px;
          font-family: var(--font-nunito), "Nunito", sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: var(--text);
          outline: none;
          transition: all 0.2s;
          appearance: none;
          -webkit-appearance: none;
        }

        .booking-page-root input[type="date"],
        .booking-page-root input[type="time"] {
          color-scheme: light;
        }

        .booking-page-root input[type="date"]::-webkit-calendar-picker-indicator,
        .booking-page-root input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(0.3) grayscale(1);
          opacity: 0.7;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .booking-page-root input[type="date"]::-webkit-calendar-picker-indicator:hover,
        .booking-page-root input[type="time"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
        
        .booking-page-root input:focus,
        .booking-page-root select:focus,
        .booking-page-root textarea:focus {
          border-color: var(--accent);
          background: white;
          box-shadow: 0 0 0 3px rgba(37,211,102,0.12);
        }
        
        .booking-page-root input::placeholder,
        .booking-page-root textarea::placeholder {
          color: #c0c8d8;
          font-weight: 400;
          font-style: italic;
        }
        
        .booking-page-root select option:first-of-type {
          color: #c0c8d8;
        }
        
        .booking-page-root input.error,
        .booking-page-root select.error,
        .booking-page-root textarea.error {
          border-color: var(--error);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }
        
        .booking-page-root .error-msg {
          font-size: 11px;
          color: var(--error);
          margin-top: 5px;
          display: none;
          text-align: left;
        }
        
        .booking-page-root .error-msg.show {
          display: block;
        }

        /* TRIP TYPE TABS */
        .booking-page-root .trip-tabs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        
        .booking-page-root .tab-btn {
          padding: 11px 6px;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          background: var(--surface);
          font-family: var(--font-nunito), "Nunito", sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: var(--muted);
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          user-select: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .booking-page-root .tab-btn .ticon {
          font-size: 18px;
          display: block;
          margin-bottom: 3px;
        }
        
        .booking-page-root .tab-btn.active-local {
          border-color: var(--accent);
          background: rgba(37,211,102,0.09);
          color: var(--accent-dark);
        }
        
        .booking-page-root .tab-btn.active-out {
          border-color: var(--outstation);
          background: rgba(124,58,237,0.09);
          color: var(--outstation);
        }

        /* CAR GRID */
        .booking-page-root .car-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        
        .booking-page-root .car-btn {
          padding: 11px 8px;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          background: var(--surface);
          font-family: var(--font-nunito), "Nunito", sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          user-select: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .booking-page-root .car-btn.active {
          border-color: var(--accent-dark);
          background: rgba(18,140,126,0.08);
          color: var(--accent-dark);
        }
        
        .booking-page-root .car-btn .icon {
          font-size: 22px;
          display: block;
          margin-bottom: 3px;
        }
        
        .booking-page-root .car-btn .car-eg {
          font-size: 10px;
          color: var(--muted);
          font-weight: 400;
        }

        /* SUB-TABS for outstation */
        .booking-page-root .sub-tabs {
          display: flex;
          gap: 8px;
        }
        
        .booking-page-root .sub-btn {
          flex: 1;
          padding: 10px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          background: var(--surface);
          font-family: var(--font-rajdhani), "Rajdhani", sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--muted);
          cursor: pointer;
          text-align: center;
          letter-spacing: 0.5px;
          transition: all 0.2s;
          user-select: none;
        }
        
        .booking-page-root .sub-btn.active {
          border-color: var(--outstation);
          background: rgba(124,58,237,0.08);
          color: var(--outstation);
        }

        /* ROUTE visual for one-way */
        .booking-page-root .route-wrap {
          position: relative;
        }
        
        .booking-page-root .route-line-vis {
          position: absolute;
          left: 7px;
          top: 24px;
          bottom: 24px;
          width: 2px;
          background: linear-gradient(to bottom, var(--accent), var(--error));
          border-radius: 2px;
        }
        
        .booking-page-root .route-field {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
        }
        
        .booking-page-root .route-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 16px;
        }
        
        .booking-page-root .route-dot.pickup {
          background: var(--accent);
          box-shadow: 0 0 0 3px rgba(37,211,102,0.2);
        }
        
        .booking-page-root .route-dot.drop {
          background: var(--error);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.2);
        }
        
        .booking-page-root .route-field .field-inner {
          flex: 1;
        }

        /* MONTHLY interview date - larger */
        .booking-page-root .interview-label {
          font-size: 15px !important;
          font-weight: 700 !important;
          color: var(--text) !important;
          text-transform: none !important;
          letter-spacing: 0 !important;
          margin-bottom: 8px;
          display: block;
        }
        
        .booking-page-root .interview-input {
          font-size: 17px !important;
          padding: 15px 16px !important;
          border-color: var(--gold) !important;
          background: #fffdf0 !important;
        }
        
        .booking-page-root .interview-input:focus {
          box-shadow: 0 0 0 3px rgba(245,184,0,0.2) !important;
        }

        /* Google Calendar add button */
        .booking-page-root .gcal-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          padding: 8px 14px;
          background: rgba(66,133,244,0.1);
          border: 1.5px solid rgba(66,133,244,0.3);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #4285F4;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }
        
        .booking-page-root .gcal-btn:hover {
          background: rgba(66,133,244,0.2);
        }

        /* Underlined date display */
        .booking-page-root .date-display {
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          text-decoration: underline;
          text-underline-offset: 3px;
          margin-top: 6px;
          display: block;
        }

        /* DURATION toggle */
        .booking-page-root .duration-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .booking-page-root .dur-btn {
          flex: 1;
          padding: 10px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          background: var(--surface);
          font-family: var(--font-rajdhani), "Rajdhani", sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--muted);
          cursor: pointer;
          text-align: center;
          letter-spacing: 0.5px;
          transition: all 0.2s;
          user-select: none;
        }
        
        .booking-page-root .dur-btn.active {
          border-color: var(--accent);
          background: rgba(37,211,102,0.08);
          color: var(--accent-dark);
        }

        .booking-page-root .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .booking-page-root .divider {
          height: 1px;
          background: var(--border);
          margin: 20px 0;
        }

        /* PREVIEW */
        .booking-page-root .preview-box {
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 18px;
          display: block;
        }
        
        .booking-page-root .preview-box h4 {
          font-family: var(--font-rajdhani), "Rajdhani", sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--accent-dark);
          margin-bottom: 10px;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .booking-page-root .preview-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          margin-bottom: 6px;
          text-align: left;
        }
        
        .booking-page-root .preview-row .key {
          color: var(--muted);
          width: 90px;
          flex-shrink: 0;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
        }
        
        .booking-page-root .preview-row .val {
          color: var(--text);
          font-weight: 600;
        }

        .booking-page-root .price-estimate {
          margin-top: 14px;
          background: linear-gradient(135deg, #1a1f36, #0f2318);
          border-radius: 14px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .booking-page-root .price-label {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
        }
        
        .booking-page-root .price-amount {
          font-family: var(--font-rajdhani), "Rajdhani", sans-serif;
          font-size: 30px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 0.5px;
        }
        
        .booking-page-root .price-note {
          width: 100%;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          margin-top: -4px;
          text-align: left;
        }

        /* BUTTONS */
        .booking-page-root .btn-whatsapp {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #25D366, #128C7E);
          color: white;
          border: none;
          border-radius: 14px;
          font-family: var(--font-rajdhani), "Rajdhani", sans-serif;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.25s;
          box-shadow: 0 6px 20px rgba(37,211,102,0.35);
          margin-bottom: 4px;
          text-decoration: none;
        }
        
        .booking-page-root .btn-whatsapp:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(37,211,102,0.45);
        }
        
        .booking-page-root .note {
          text-align: center;
          font-size: 12px;
          color: var(--accent-dark);
          font-weight: 600;
          margin-top: 10px;
        }

        /* Location field */
        .booking-page-root .btn-location {
          width: 100%;
          padding: 13px 16px;
          background: var(--surface);
          border: 1.5px dashed var(--accent);
          border-radius: 12px;
          font-family: var(--font-nunito), "Nunito", sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--accent-dark);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        
        .booking-page-root .btn-location:hover {
          background: rgba(37,211,102,0.08);
        }
        
        .booking-page-root .btn-location.captured {
          border-style: solid;
          background: rgba(37,211,102,0.06);
          color: var(--accent-dark);
        }
        
        .booking-page-root .location-result {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 10px 12px;
          flex-wrap: wrap;
        }
        
        .booking-page-root .loc-ok {
          font-size: 16px;
        }
        
        .booking-page-root .loc-map-link {
          font-size: 12px;
          color: var(--accent-dark);
          text-decoration: underline;
          margin-left: auto;
          font-weight: bold;
        }

        /* Price table in TNC */
        .booking-page-root .price-table {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 8px;
          width: 100%;
        }
        
        .booking-page-root .pt-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(124,58,237,0.06);
          border-radius: 6px;
          padding: 5px 10px;
          font-size: 12px;
        }
        
        .booking-page-root .pt-km {
          color: #4a4060;
        }
        
        .booking-page-root .pt-pr {
          font-weight: 700;
          color: #7c3aed;
        }
        
        .booking-page-root .pt-note .pt-pr {
          color: var(--muted);
          font-weight: 400;
          font-style: italic;
        }

        /* Proposal highlight */
        .booking-page-root .tnc-proposal-highlight {
          background: linear-gradient(135deg, rgba(245,184,0,0.12), rgba(245,184,0,0.06)) !important;
          border: 1.5px solid rgba(245,184,0,0.35) !important;
          border-radius: 12px !important;
          padding: 12px 14px;
          text-align: left;
        }
        
        .booking-page-root .tnc-proposal-highlight .tnc-text {
          color: #8a6000;
        }

        /* Monthly breakdown in price box */
        .booking-page-root .price-breakdown-monthly {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-bottom: 4px;
        }
        
        .booking-page-root .pbm-base {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
        }
        
        .booking-page-root .pbm-extra {
          font-size: 12px;
          color: #f5b800;
          font-weight: 600;
        }
        
        .booking-page-root .pbm-sep {
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 2px;
        }

        /* Security note */
        .booking-page-root .secure-note {
          font-size: 11px;
          color: var(--accent-dark);
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          text-align: left;
        }

        /* RT location row */
        .booking-page-root .rt-location-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .booking-page-root .btn-location-sm {
          padding: 11px 10px;
          font-size: 12px;
        }
        
        .booking-page-root .location-result-sm {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 10px 12px;
          margin-top: 0;
        }

        /* Extra amount row */
        .booking-page-root .extra-amt-row {
          display: flex;
          align-items: stretch;
        }
        
        .booking-page-root .extra-prefix {
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 12px 0 0 12px;
          border-right: none;
          padding: 0 14px;
          display: flex;
          align-items: center;
          font-weight: 700;
          color: var(--muted);
          font-size: 16px;
        }

        /* Monthly breakdown */
        .booking-page-root .mprice-breakdown {
          display: flex;
          flex-direction: column;
          gap: 2px;
          width: 100%;
          text-align: left;
        }
        
        .booking-page-root .mprice-base-line {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
        }
        
        .booking-page-root .mprice-extra-line {
          font-size: 12px;
          color: #f5b800;
        }
        
        .booking-page-root .mprice-sep {
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 2px;
        }

        /* Monthly price badge */
        .booking-page-root .monthly-price-badge {
          background: linear-gradient(135deg, #1a1f36, #2a1a05);
          border-radius: 14px;
          padding: 14px 16px;
          margin-top: 2px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          animation: riseUp 0.3s ease;
        }
        
        .booking-page-root .mprice-label {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          text-align: left;
        }
        
        .booking-page-root .mprice-val {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          text-align: left;
        }
        
        .booking-page-root .mprice-amt {
          font-family: var(--font-rajdhani), "Rajdhani", sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #f5b800;
          letter-spacing: 0.5px;
        }
        
        .booking-page-root .mprice-note {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          text-align: left;
        }

        /* T&C Card */
        .booking-page-root .tnc-card {
          background: var(--white);
          border-radius: 20px;
          padding: 22px;
          box-shadow: var(--shadow);
        }
        
        .booking-page-root .tnc-heading {
          font-family: var(--font-rajdhani), "Rajdhani", sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 14px;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          gap: 6px;
          text-align: left;
        }
        
        .booking-page-root .tnc-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 12px;
          text-align: left;
        }
        
        .booking-page-root .tnc-item:last-child {
          margin-bottom: 0;
        }
        
        .booking-page-root .tnc-bullet {
          width: 20px;
          height: 20px;
          background: rgba(37,211,102,0.1);
          border: 1px solid rgba(37,211,102,0.2);
          border-radius: 50%;
          color: var(--accent-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          flex-shrink: 0;
        }
        
        .booking-page-root .tnc-bullet.violet {
          background: rgba(124,58,237,0.08);
          border-color: rgba(124,58,237,0.2);
          color: var(--outstation);
        }
        
        .booking-page-root .tnc-text {
          color: var(--muted);
        }
        
        .booking-page-root .tnc-text strong {
          color: var(--text);
          font-weight: 700;
        }
        
        .booking-page-root .tnc-divider {
          height: 1.5px;
          background: var(--border);
          margin: 18px 0;
          opacity: 0.6;
        }
      ` }} />

        {/* ═══════════ HERO SECTION ═══════════ */}
        <section className="hero">
          <div className="hero-inner">
            <h1>Book a <em>Verified</em> Driver Instantly</h1>
            <p>Delhi NCR's most trusted on-demand driver service.</p>

            <div className="trust-badges">
              <div className="badge"><span>✓</span> Background <em>Verified</em></div>
              <div className="badge"><span>✓</span> Aadhaar <em>KYC</em></div>
              <div className="badge"><span>✓</span> License <em>Checked</em></div>
              <div className="badge"><span>✓</span> No App <em>Required</em></div>
            </div>
          </div>
        </section>

        {/* ═══════════ FORM SECTION ═══════════ */}
        <main className="form-wrap ">
          <form onSubmit={handleBookingSubmit}>
            <div className="form-card">
              <h2 className="form-title">Fill Booking Details</h2>

              {/* Name */}
              <div className="field">
                <label htmlFor="name-field">Your Name</label>
                <input
                  id="name-field"
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value)
                    if (errors.custName) setErrors(prev => { const c = { ...prev }; delete c.custName; return c; })
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className={cn(errors.custName && 'error')}
                />
                <span className={cn("error-msg", errors.custName && "show")}>{errors.custName}</span>
              </div>

              {/* WhatsApp Phone */}
              <div className="field">
                <label htmlFor="phone-field">WhatsApp Number</label>
                <input
                  id="phone-field"
                  type="tel"
                  value={phoneVal}
                  onChange={(e) => {
                    setPhoneVal(e.target.value.replace(/\D/g, '').slice(0, 10))
                    if (errors.custPhone) setErrors(prev => { const c = { ...prev }; delete c.custPhone; return c; })
                  }}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  className={cn(errors.custPhone && 'error')}
                />
                <span className={cn("error-msg", errors.custPhone && "show")}>{errors.custPhone}</span>
                <div className="secure-note">
                  <span>🔒</span> Your personal info is secured and will not be shared.
                </div>
              </div>

              {/* Email Val (kept hidden / backup input to match state variables) */}
              <input type="hidden" value={emailVal} onChange={(e) => setEmailVal(e.target.value)} />

              {/* Trip Type Tabs */}
              <div className="field">
                <label>Trip Type</label>
                <div className="trip-tabs">
                  {[
                    { id: 'oneway', label: 'One Way', icon: '➡️', isLocal: true },
                    { id: 'roundtrip', label: 'Round Trip', icon: '🔄', isLocal: true },
                    { id: 'monthly', label: 'Monthly', icon: '📅', isLocal: false },
                    { id: 'outstation', label: 'Outstation', icon: '🛣️', isLocal: false },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTripType(t.id as TripType)
                        setErrors({})
                      }}
                      className={cn(
                        'tab-btn',
                        tripType === t.id && (t.isLocal ? 'active-local' : 'active-out')
                      )}
                    >
                      <span className="ticon">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Car Type Grid */}
              <div className="field">
                <label>Car Type</label>
                <div className="car-grid">
                  {[
                    { id: 'hatchback', label: 'Hatchback', icon: '🚗', eg: 'Alto, WagonR, i20' },
                    { id: 'sedan', label: 'Sedan', icon: '🚙', eg: 'Dzire, Ciaz, Amaze' },
                    { id: 'suv', label: 'SUV', icon: '🚐', eg: 'Innova, Ertiga, Creta' },
                    { id: 'luxury', label: 'Luxury', icon: '🏎️', eg: 'BMW, Audi, Mercedes' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCarType(c.id as CarType)
                        if (errors.carType) setErrors(prev => { const copy = { ...prev }; delete copy.carType; return copy; })
                      }}
                      className={cn('car-btn', carType === c.id && 'active')}
                    >
                      <span className="icon">{c.icon}</span>
                      <span className="car-label">{c.label}</span>
                      <span className="car-eg">{c.eg}</span>
                    </button>
                  ))}
                </div>
                <span className={cn("error-msg", errors.carType && "show")}>{errors.carType}</span>
              </div>

              {/* ── CONDITIONAL GROUPS ── */}

              {/* 1. ONE WAY GROUP */}
              {tripType === 'oneway' && (
                <>
                  <div className="route-wrap">
                    <div className="route-line-vis"></div>

                    {/* Pickup Location */}
                    <div className="route-field">
                      <div className="route-dot pickup"></div>
                      <div className="field-inner">
                        <div className="field">
                          <label htmlFor="pickup-field">Pickup Location</label>
                          <input
                            id="pickup-field"
                            type="text"
                            value={pickup}
                            onChange={(e) => {
                              setPickup(e.target.value)
                              if (errors.pickup) setErrors(prev => { const c = { ...prev }; delete c.pickup; return c; })
                            }}
                            placeholder="e.g. Sector 29, Gurgaon"
                            className={cn(errors.pickup && 'error')}
                          />
                          <span className={cn("error-msg", errors.pickup && "show")}>{errors.pickup}</span>
                        </div>
                      </div>
                    </div>

                    {/* Drop Location */}
                    <div className="route-field">
                      <div className="route-dot drop"></div>
                      <div className="field-inner">
                        <div className="field">
                          <label htmlFor="drop-field">Drop Location</label>
                          <input
                            id="drop-field"
                            type="text"
                            value={drop}
                            onChange={(e) => {
                              setDrop(e.target.value)
                              if (errors.drop) setErrors(prev => { const c = { ...prev }; delete c.drop; return c; })
                            }}
                            placeholder="e.g. Cyber City, DLF Phase 2"
                            className={cn(errors.drop && 'error')}
                          />
                          <span className={cn("error-msg", errors.drop && "show")}>{errors.drop}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Distance */}
                  <div className="field">
                    <label htmlFor="distance-field">Estimated Distance</label>
                    <select
                      id="distance-field"
                      value={estKms || ''}
                      onChange={(e) => {
                        setEstKms(Number(e.target.value))
                        if (errors.estKms) setErrors(prev => { const c = { ...prev }; delete c.estKms; return c; })
                      }}
                      className={cn(errors.estKms && 'error')}
                    >
                      <option value="">— Select Distance —</option>
                      {[10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70].map((val) => (
                        <option key={val} value={val}>{val} km</option>
                      ))}
                    </select>
                    <span className={cn("error-msg", errors.estKms && "show")}>{errors.estKms}</span>
                  </div>
                </>
              )}

              {/* 2. ROUND TRIP GROUP */}
              {tripType === 'roundtrip' && (
                <div className="field">
                  <label htmlFor="hours-field">Total Hours Required</label>
                  <input
                    id="hours-field"
                    type="number"
                    value={roundHours || ''}
                    onChange={(e) => {
                      setRoundHours(Number(e.target.value))
                      if (errors.roundHours) setErrors(prev => { const c = { ...prev }; delete c.roundHours; return c; })
                    }}
                    placeholder="e.g. 4 (min 2 hours)"
                    min="2"
                    max="24"
                    className={cn(errors.roundHours && 'error')}
                  />
                  <span className={cn("error-msg", errors.roundHours && "show")}>{errors.roundHours}</span>

                  <div className="rt-location-row" style={{ marginTop: '16px' }}>
                    <div className="field" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '10px' }}>📍 Live Location</label>
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={capturingLocation}
                        className={cn('btn-location btn-location-sm', locationCaptured && 'captured')}
                      >
                        {capturingLocation ? '⏳ Fetching...' : locationCaptured ? '✅ Shared' : '📍 Share'}
                      </button>
                    </div>
                    <div className="field" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <label style={{ fontSize: '10px', marginBottom: '4px' }}>📌 Status</label>
                      {locationCaptured ? (
                        <div className="location-result-sm" style={{ padding: '8px' }}>
                          <a
                            href={`https://www.google.com/maps?q=${userLat},${userLng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="loc-map-link"
                            style={{ fontSize: '11px', textDecoration: 'underline' }}
                          >
                            View on Map
                          </a>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#8892aa', fontStyle: 'italic' }}>Not shared yet</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. MONTHLY GROUP */}
              {tripType === 'monthly' && (
                <>
                  <div className="field" style={{ background: '#f5f7fa', border: '1.5px solid #dde3ef', borderRadius: '12px', padding: '14px', display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-primary" style={{ textAlign: 'left' }}>Monthly Contract Interview</h4>
                      <p className="text-[10px] text-text-muted leading-relaxed mt-0.5" style={{ textAlign: 'left' }}>
                        We organize a face-to-face trial with the candidate. Select your preferred date & time below.
                      </p>
                    </div>
                  </div>

                  <div className="two-col">
                    <div className="field">
                      <label htmlFor="int-date-field" className="interview-label">🗓 Interview Date</label>
                      <input
                        id="int-date-field"
                        type="date"
                        value={interviewDate}
                        onChange={(e) => handleDateTimeChange(e.target.value, interviewTime, 'interview')}
                        className={cn("interview-input", errors.interviewDate && 'error')}
                      />
                      <span className={cn("error-msg", errors.interviewDate && "show")}>{errors.interviewDate}</span>
                    </div>
                    <div className="field">
                      <label htmlFor="int-time-field" className="interview-label">🕐 Start Time</label>
                      <input
                        id="int-time-field"
                        type="time"
                        value={interviewTime}
                        onChange={(e) => handleDateTimeChange(interviewDate, e.target.value, 'interview')}
                        className={cn("interview-input", errors.interviewTime && 'error')}
                      />
                      <span className={cn("error-msg", errors.interviewTime && "show")}>{errors.interviewTime}</span>
                    </div>
                  </div>

                  {interviewDate && interviewTime && (
                    <div className="field" style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <span className="date-display">📅 {getNiceDateTime()}</span>
                      <a
                        href={getGoogleCalendarUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="gcal-btn"
                      >
                        📅 Add Interview to Google Calendar
                      </a>
                    </div>
                  )}

                  <div className="field">
                    <label htmlFor="monthly-days-field">Working Days per Month</label>
                    <input
                      id="monthly-days-field"
                      type="number"
                      value={monthlyDays || ''}
                      onChange={(e) => {
                        setMonthlyDays(Number(e.target.value))
                        if (errors.monthlyDays) setErrors(prev => { const c = { ...prev }; delete c.monthlyDays; return c; })
                      }}
                      placeholder="e.g. 26"
                      min="1"
                      max="31"
                      className={cn(errors.monthlyDays && 'error')}
                    />
                    <span className={cn("error-msg", errors.monthlyDays && "show")}>{errors.monthlyDays}</span>
                  </div>

                  <div className="field">
                    <label htmlFor="monthly-hours-field">Hours per Day</label>
                    <input
                      id="monthly-hours-field"
                      type="number"
                      value={monthlyHours || ''}
                      onChange={(e) => {
                        setMonthlyHours(Number(e.target.value))
                        if (errors.monthlyHours) setErrors(prev => { const c = { ...prev }; delete c.monthlyHours; return c; })
                      }}
                      placeholder="e.g. 10"
                      min="1"
                      max="24"
                      className={cn(errors.monthlyHours && 'error')}
                    />
                    <span className={cn("error-msg", errors.monthlyHours && "show")}>{errors.monthlyHours}</span>
                  </div>

                  {monthlyDays > 0 && monthlyHours > 0 && (
                    <div className="field">
                      <label htmlFor="extra-amt-field">Extra Amount (Optional)</label>
                      <div className="extra-amt-row">
                        <span className="extra-prefix">₹</span>
                        <input
                          id="extra-amt-field"
                          type="number"
                          value={extraAmt || ''}
                          onChange={(e) => setExtraAmt(Number(e.target.value))}
                          placeholder="e.g. 2000"
                          min="0"
                          step="500"
                          className={cn(inputBaseStyleOverride)}
                        />
                      </div>
                      <p style={{ fontSize: '9px', color: '#8892aa', fontStyle: 'italic', marginTop: '4px', textAlign: 'left' }}>
                        Higher amount = more driver interest = faster recruitment.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* 4. OUTSTATION GROUP */}
              {tripType === 'outstation' && (
                <>
                  <div className="field">
                    <div className="sub-tabs">
                      {[
                        { id: 'oneway', label: '➡️ One Way' },
                        { id: 'roundtrip', label: '🔄 Round Trip' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setOutSubType(mode.id as OutstationType)}
                          className={cn('sub-btn', outSubType === mode.id && 'active')}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="out-pickup-field">Pickup City / Location</label>
                    <input
                      id="out-pickup-field"
                      type="text"
                      value={outPickup}
                      onChange={(e) => {
                        setOutPickup(e.target.value)
                        if (errors.outPickup) setErrors(prev => { const c = { ...prev }; delete c.outPickup; return c; })
                      }}
                      placeholder="e.g. Connaught Place, Delhi"
                      className={cn(errors.outPickup && 'error')}
                    />
                    <span className={cn("error-msg", errors.outPickup && "show")}>{errors.outPickup}</span>
                  </div>

                  {outSubType === 'oneway' ? (
                    <>
                      <div className="field">
                        <label htmlFor="out-drop-field">Drop City / Location</label>
                        <input
                          id="out-drop-field"
                          type="text"
                          value={outDrop}
                          onChange={(e) => {
                            setOutDrop(e.target.value)
                            if (errors.outDrop) setErrors(prev => { const c = { ...prev }; delete c.outDrop; return c; })
                          }}
                          placeholder="e.g. Jaipur, Rajasthan"
                          className={cn(errors.outDrop && 'error')}
                        />
                        <span className={cn("error-msg", errors.outDrop && "show")}>{errors.outDrop}</span>
                      </div>

                      <div className="field">
                        <label htmlFor="out-kms-field">Estimated Distance (One Way)</label>
                        <select
                          id="out-kms-field"
                          value={outKms || ''}
                          onChange={(e) => {
                            setOutKms(Number(e.target.value))
                            if (errors.outKms) setErrors(prev => { const c = { ...prev }; delete c.outKms; return c; })
                          }}
                          className={cn(errors.outKms && 'error')}
                        >
                          <option value="">— Select Distance —</option>
                          {[100, 150, 200, 250, 300, 350, 400].map((val) => (
                            <option key={val} value={val}>{val} km</option>
                          ))}
                        </select>
                        <span className={cn("error-msg", errors.outKms && "show")}>{errors.outKms}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="field">
                        <label htmlFor="out-dest-field">Destination City</label>
                        <input
                          id="out-dest-field"
                          type="text"
                          value={outDest}
                          onChange={(e) => {
                            setOutDest(e.target.value)
                            if (errors.outDest) setErrors(prev => { const c = { ...prev }; delete c.outDest; return c; })
                          }}
                          placeholder="e.g. Agra, Taj Mahal"
                          className={cn(errors.outDest && 'error')}
                        />
                        <span className={cn("error-msg", errors.outDest && "show")}>{errors.outDest}</span>
                      </div>

                      <div className="field">
                        <label htmlFor="out-days-field">Number of Days</label>
                        <input
                          id="out-days-field"
                          type="number"
                          value={outDays || ''}
                          onChange={(e) => {
                            setOutDays(Number(e.target.value))
                            if (errors.outDays) setErrors(prev => { const c = { ...prev }; delete c.outDays; return c; })
                          }}
                          placeholder="e.g. 2"
                          min="1"
                          max="30"
                          className={cn(errors.outDays && 'error')}
                        />
                        <span className={cn("error-msg", errors.outDays && "show")}>{errors.outDays}</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Optional GPS Location button for non-roundtrip */}
              {tripType !== 'roundtrip' && (
                <div className="field">
                  <label>📍 Share Your Location (Optional)</label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={capturingLocation}
                    className={cn('btn-location', locationCaptured && 'captured')}
                  >
                    <Compass className={cn('h-4 w-4 shrink-0', capturingLocation && 'animate-spin')} />
                    {capturingLocation ? 'Capturing Location...' : locationCaptured ? '✅ Location Captured!' : 'Tap to share current location'}
                  </button>
                  {locationCaptured && (
                    <div className="location-result">
                      <span className="loc-ok">✅</span>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-dark)' }}>Captured! (Lat: {userLat}, Lng: {userLng})</span>
                      <a
                        href={`https://www.google.com/maps?q=${userLat},${userLng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="loc-map-link"
                      >
                        View Map
                      </a>
                    </div>
                  )}
                  <p style={{ fontSize: '9px', color: '#8892aa', fontStyle: 'italic', marginTop: '4px', textAlign: 'left' }}>Helps us dispatch the nearest driver faster.</p>
                </div>
              )}

              {/* Booking Date & Time for non-monthly trips */}
              {tripType !== 'monthly' && (
                <div className="field">
                  <label>Date & Time</label>
                  <div className="two-col">
                    <div>
                      <input
                        type="date"
                        value={bookDate}
                        onChange={(e) => handleDateTimeChange(e.target.value, bookTime, 'book')}
                        className={cn(errors.bookDate && 'error')}
                      />
                      <span className={cn("error-msg", errors.bookDate && "show")}>{errors.bookDate}</span>
                    </div>
                    <div>
                      <input
                        type="time"
                        value={bookTime}
                        onChange={(e) => handleDateTimeChange(bookDate, e.target.value, 'book')}
                        className={cn(errors.bookTime && 'error')}
                      />
                      <span className={cn("error-msg", errors.bookTime && "show")}>{errors.bookTime}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Pickup for RT & Monthly */}
              {(tripType === 'roundtrip' || tripType === 'monthly') && (
                <div className="field">
                  <label htmlFor="pickup-common-field">Pickup Location</label>
                  <input
                    id="pickup-common-field"
                    type="text"
                    value={pickupCommon}
                    onChange={(e) => {
                      setPickupCommon(e.target.value)
                      if (errors.pickupCommon) setErrors(prev => { const c = { ...prev }; delete c.pickupCommon; return c; })
                    }}
                    placeholder="e.g. Sector 29, Gurgaon"
                    className={cn(errors.pickupCommon && 'error')}
                  />
                  <span className={cn("error-msg", errors.pickupCommon && "show")}>{errors.pickupCommon}</span>
                </div>
              )}

              {/* Comments */}
              <div className="field">
                <label htmlFor="comments-field">Additional Comments (Optional)</label>
                <textarea
                  id="comments-field"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Any special requests, automatic or manual transmission, preferred language..."
                  rows={3}
                />
              </div>

              <div className="divider"></div>

              {/* Live Preview Card */}
              {(customerName || phoneVal || carType || pickup || pickupCommon || outPickup) && (
                <div className="preview-box">
                  <h4>
                    <MessageSquare className="h-4.5 w-4.5 text-accent-dark" /> Live Summary Preview
                  </h4>

                  <div className="preview-row">
                    <span className="key">Name</span>
                    <span className="val">{customerName || '—'}</span>
                  </div>
                  <div className="preview-row">
                    <span className="key">Phone</span>
                    <span className="val">{phoneVal ? `+91 ${phoneVal}` : '—'}</span>
                  </div>
                  <div className="preview-row">
                    <span className="key">Trip Type</span>
                    <span className="val" style={{ textTransform: 'capitalize' }}>
                      {tripType === 'outstation'
                        ? `Outstation (${outSubType === 'oneway' ? 'One Way' : 'Round Trip'})`
                        : tripType === 'oneway'
                          ? 'One Way'
                          : tripType === 'roundtrip'
                            ? 'Round Trip'
                            : 'Monthly'}
                    </span>
                  </div>
                  <div className="preview-row">
                    <span className="key">Car Type</span>
                    <span className="val" style={{ textTransform: 'capitalize' }}>{carType || '—'}</span>
                  </div>
                  <div className="preview-row">
                    <span className="key">Pickup</span>
                    <span className="val">
                      {tripType === 'oneway'
                        ? pickup
                        : tripType === 'roundtrip' || tripType === 'monthly'
                          ? pickupCommon
                          : outPickup || '—'}
                    </span>
                  </div>
                  {tripType === 'oneway' && (
                    <div className="preview-row">
                      <span className="key">Drop</span>
                      <span className="val">{drop || '—'}</span>
                    </div>
                  )}
                  {tripType === 'outstation' && outSubType === 'oneway' && (
                    <div className="preview-row">
                      <span className="key">Drop</span>
                      <span className="val">{outDrop || '—'}</span>
                    </div>
                  )}
                  {tripType === 'outstation' && outSubType === 'roundtrip' && (
                    <div className="preview-row">
                      <span className="key">Destination</span>
                      <span className="val">{outDest || '—'}</span>
                    </div>
                  )}
                  <div className="preview-row">
                    <span className="key">Date & Time</span>
                    <span className="val">{getNiceDateTime()}</span>
                  </div>

                  {/* Realtime Fare/Salary Box */}
                  {(amount || note) && (
                    <>
                      {tripType === 'monthly' ? (
                        <div className="monthly-price-badge">
                          <span className="mprice-label">💰 Estimated Salary</span>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span className="mprice-amt">{totalFare ? `₹${totalFare.toLocaleString('en-IN')}` : '—'}</span>
                            <span className="mprice-val">/ month</span>
                          </div>
                          {monthlyDays > 0 && monthlyHours > 0 && (
                            <div className="mprice-breakdown">
                              <span className="mprice-base-line">📅 Package: {monthlyDays} days × {monthlyHours} hrs/day</span>
                              <span className="mprice-base-line">💼 Base Salary: ₹{calcMonthlyPriceVal(monthlyDays, monthlyHours).amount.toLocaleString('en-IN')}</span>
                              {extraAmt > 0 && <span className="mprice-extra-line">➕ Extra Interest Amt: +₹{extraAmt.toLocaleString('en-IN')}</span>}
                              <span className="mprice-sep">━━━━━</span>
                            </div>
                          )}
                          <span className="mprice-note">{note}</span>
                        </div>
                      ) : (
                        <div className="price-estimate">
                          <span className="price-label">💰 Estimated Fare</span>
                          <span className="price-amount">{totalFare ? `₹${totalFare.toLocaleString('en-IN')}` : '—'}</span>

                          {nightCharge > 0 && (
                            <span className="price-note" style={{ color: 'var(--accent)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                              <span>🌙</span> Includes ₹200 Night Travel Allowance (10PM–6AM)
                            </span>
                          )}

                          <span className="price-note">{note}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-whatsapp"
                style={{ opacity: submitting ? 0.65 : 1, pointerEvents: submitting ? 'none' : 'auto' }}
              >
                {submitting ? (
                  <div style={{ height: '20px', width: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="h-5 w-5" />
                    Send Booking on WhatsApp
                  </>
                )}
              </button>
              <div className="note">
                Your details will be sent to our team via WhatsApp instantly.
              </div>

            </div>

            {/* ═══════════ TERMS & CONDITIONS CARD ═══════════ */}
            <div className="tnc-card" style={{ marginTop: '24px' }}>
              <h3 className="tnc-heading">
                <span>💰</span> Pricing & Extra Charges
              </h3>

              {tripType === 'oneway' && (
                <>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text"><strong>₹7 per km</strong> extra if actual distance exceeds your booked KM limit.</div>
                  </div>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text">Waiting period: <strong>₹40 every half hour</strong> (after a 15-minute start delay exception).</div>
                  </div>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text">Driver return charges are <strong>already included</strong> in the package.</div>
                  </div>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text"><strong>₹200 Night Travel Allowance (NTA)</strong> applicable between 10:00 PM – 6:00 AM.</div>
                  </div>
                </>
              )}

              {tripType === 'roundtrip' && (
                <>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text"><strong>₹2.5 per minute</strong> to be charged if travel time exceeds booked hours.</div>
                  </div>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text"><strong>₹200 Night Travel Allowance (NTA)</strong> applicable between 10:00 PM – 6:00 AM.</div>
                  </div>
                </>
              )}

              {tripType === 'outstation' && (
                <>
                  {outSubType === 'oneway' ? (
                    <>
                      <div className="tnc-item">
                        <div className="tnc-bullet violet">✓</div>
                        <div className="tnc-text">Driver return fare is <strong>already included</strong> in the package — no extra return amount.</div>
                      </div>
                      <div className="tnc-item">
                        <div className="tnc-bullet violet">✓</div>
                        <div className="tnc-text"><strong>₹7 per km</strong> extra if actual distance exceeds your booked KM limit.</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="tnc-item">
                        <div className="tnc-bullet violet">✓</div>
                        <div className="tnc-text">Price calculated for maximum <strong>12 hours</strong> — if exceeded, <strong>₹2 per minute</strong> extra on same day.</div>
                      </div>
                      <div className="tnc-item">
                        <div className="tnc-bullet violet">✓</div>
                        <div className="tnc-text">If next day added, additional day package price will be appended to your billing.</div>
                      </div>
                    </>
                  )}
                </>
              )}

              {tripType === 'monthly' && (
                <>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text">Prices shown are <strong>minimum salary</strong> — final salary decided by you at interview.</div>
                  </div>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text">Available packages: 22 / 24 / 26 days × 8 / 10 / 12 hours per day.</div>
                  </div>
                  {/* <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text"><strong>₹200 Night Travel Allowance (NTA)</strong> applicable between 10:00 PM – 6:00 AM.</div>
                  </div> */}
                </>
              )}

              <div className="tnc-divider"></div>

              <h3 className="tnc-heading">
                <span>📌</span> Key Pointers
              </h3>

              {tripType !== 'monthly' && (
                <>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text">Nearby verified driver at your doorstep within <strong>60 minutes</strong>.</div>
                  </div>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text">All drivers are experienced and background verified.</div>
                  </div>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text"><strong>Pay at the end of the trip</strong> — no advance needed.</div>
                  </div>
                </>
              )}

              {tripType === 'oneway' && (
                <div className="tnc-item">
                  <div className="tnc-bullet">✓</div>
                  <div className="tnc-text">No need to provide food or travel expenses to the driver.</div>
                </div>
              )}

              {tripType === 'roundtrip' && (
                <div className="tnc-item">
                  <div className="tnc-bullet">✓</div>
                  <div className="tnc-text">No need to provide food or travel expenses to the driver.</div>
                </div>
              )}

              {tripType === 'outstation' && (
                <>
                  <div className="tnc-item">
                    <div className="tnc-bullet violet">✓</div>
                    <div className="tnc-text"><strong>₹200 Night Travel Allowance (NTA)</strong> applicable between 10:00 PM – 6:00 AM.</div>
                  </div>
                  <div className="tnc-item">
                    <div className="tnc-bullet violet">✓</div>
                    <div className="tnc-text"><strong>Food & stay charges will be levied to the customer</strong> for outstation trips.</div>
                  </div>
                  {outSubType === 'oneway' && (
                    <>
                      <div className="tnc-item">
                        <div className="tnc-bullet violet">✓</div>
                        <div className="tnc-text">Customer's responsibility to provide conveyance fare to the nearest bus stand/railway station when trip ends.</div>
                      </div>
                      <div className="tnc-item">
                        <div className="tnc-bullet violet">✓</div>
                        <div className="tnc-text">One-way driver food to be managed by Customer.</div>
                      </div>
                    </>
                  )}
                  <div className="tnc-item">
                    <div className="tnc-bullet violet">✓</div>
                    <div className="tnc-text"><strong>Pay at the end of the trip</strong> — no advance needed.</div>
                  </div>
                </>
              )}

              {tripType === 'monthly' && (
                <>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text">All drivers are experienced and background verified.</div>
                  </div>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text"><strong>Final salary to be decided by you in the Interview.</strong></div>
                  </div>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text">Driver will be available for the agreed hours every day.</div>
                  </div>
                  <div className="tnc-item">
                    <div className="tnc-bullet">✓</div>
                    <div className="tnc-text"><strong>Monthly salary to be credited by you directly</strong> to the driver.</div>
                  </div>

                  <div className="tnc-proposal-highlight" style={{ marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '16px' }} className="shrink-0">📩</span>
                    <span className="tnc-text" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                      A proposal will be sent to you on WhatsApp / Email with candidate driver profiles.
                    </span>
                  </div>
                </>
              )}
            </div>

          </form>
        </main>
      </div>

      <Footer />
    </div>
  )
}

const inputBaseStyleOverride = 'w-full px-4 py-3.5 bg-surface2 border border-border/30 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-surface focus:outline-none transition-all duration-300 text-sm text-foreground placeholder:text-text-muted/60 placeholder:italic'
