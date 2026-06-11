'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { supabase } from '@/lib/supabaseClient'
import {
  CheckCircle,
  Compass,
  AlertCircle,
  HelpCircle,
  Mail,
  User,
  Phone,
  MessageSquare,
  Sparkles,
  Shield,
  Clock,
  MapPin,
  Navigation,
  ChevronRight,
  Star,
  Zap,
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { WHATSAPP_CUSTOMER, getWhatsAppLink } from '@/constants'
import { cn } from '@/lib/utils'

type TripType = 'oneway' | 'roundtrip' | 'monthly' | 'outstation'
type CarType = 'hatchback' | 'sedan' | 'suv' | 'luxury'
type OutstationType = 'oneway' | 'roundtrip'

/* ─── Decorative SVG Vectors ─── */
function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Large gold orb */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/12 to-transparent blur-3xl animate-float" />
      {/* Emerald glow bottom-left */}
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-500/10 to-transparent blur-3xl animate-float-delay-2" />
      {/* Small accent orb */}
      <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-primary/5 to-emerald-500/5 blur-2xl animate-float-delay-3" />
    </div>
  )
}

function HeroGridPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="booking-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-primary" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#booking-grid)" />
    </svg>
  )
}

function DiamondAccent({ className }: { className?: string }) {
  return (
    <svg className={cn("w-3 h-3 text-primary/40", className)} viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 0L12 6L6 12L0 6Z" />
    </svg>
  )
}

/* ─── Input helper component ─── */
function InputField({ label, icon: Icon, error, children, className: cls }: { label: string; icon?: any; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-2', cls)}>
      <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-foreground/70 tracking-[0.08em] uppercase">
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[10px] text-rose-400 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  )
}

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
    10: 299, 15: 349, 20: 399, 25: 449, 30: 499, 35: 539, 
    40: 579, 45: 619, 50: 659, 55: 699, 60: 739, 65: 779, 70: 819
  }
  const roundTripPrices: Record<number, number> = {
    2: 349, 3: 399, 4: 499, 5: 599, 6: 699, 7: 799, 
    8: 899, 9: 999, 10: 1099, 11: 1199, 12: 1299
  }

  const getOneWayPrice = (km: number) => {
    const slabs = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]
    if (km > 70) return 819 + Math.round((km - 70) * 10)
    for (let i = slabs.length - 1; i >= 0; i--) {
      if (km >= slabs[i]) return oneWayPrices[slabs[i]]
    }
    return null
  }

  const getRoundTripPrice = (hrs: number) => {
    if (hrs < 2) return null
    if (hrs > 12) return 1299 + (hrs - 12) * 100
    return roundTripPrices[hrs] || null
  }

  const getOutstationOWPrice = (km: number) => {
    const outstationSlabs = [
      { min: 0,   max: 100,  price: 1099 },
      { min: 100, max: 150,  price: 1299 },
      { min: 150, max: 200,  price: 1499 },
      { min: 200, max: 250,  price: 1699 },
      { min: 250, max: 300,  price: 1899 },
      { min: 300, max: 350,  price: 2099 },
      { min: 350, max: 9999, price: 2299 }
    ]
    for (const s of outstationSlabs) {
      if (km >= s.min && km < s.max) return s.price
    }
    return 2299
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
            ? '₹1,299 + ₹100 per extra hour · ₹2.5/min if time exceeded' 
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
            1: 1250, 2: 2400, 3: 3550, 4: 4700, 5: 5850, 6: 7000, 7: 8150
          }
          amount = outRTprices[outDays] || (outDays * 1150)
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
      const firstErrorEl = document.querySelector('.text-rose-400')
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

  // Helper inputs mapping
  const inputBase = 'w-full px-4 py-3.5 bg-surface2 border border-border/30 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-surface focus:outline-none transition-all duration-300 text-sm text-foreground placeholder:text-text-muted/60 placeholder:italic'

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <Toaster position="top-center" richColors />
      <Navbar />

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a0f1a] to-[#0d1a12] dark:block hidden" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-[#f5f8fc] to-[#eef7f2] dark:hidden block" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,146,42,0.08),transparent_60%)] dark:block hidden" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,146,42,0.04),transparent_60%)] dark:hidden block" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.06),transparent_60%)] dark:block hidden" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.03),transparent_60%)] dark:hidden block" />
        <HeroGridPattern />
        <FloatingOrbs />

        {/* Curved bottom separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 80V20C360 70 720 0 1080 40C1260 55 1380 65 1440 70V80H0Z" className="fill-background" />
          </svg>
        </div>

        <div className="relative z-10 max-w-lg mx-auto px-6 text-center space-y-4">
          <div className="logo-text-mark flex justify-center items-center gap-0.5">
            <span className="font-sans font-bold text-4xl tracking-wide text-foreground">Scan</span>
            <span className="font-sans font-bold text-4xl tracking-wide text-primary">Driver</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight leading-[1.2] text-foreground">
            Book a <em className="text-primary not-italic">Verified</em> Driver Instantly
          </h1>
          <p className="text-xs text-text-muted leading-relaxed">
            Delhi NCR's most trusted on-demand driver service.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <span className="px-3 py-1 rounded-full bg-surface2 border border-border/25 text-[10px] font-bold text-text-muted">✓ Background Verified</span>
            <span className="px-3 py-1 rounded-full bg-surface2 border border-border/25 text-[10px] font-bold text-text-muted">✓ Aadhaar KYC</span>
            <span className="px-3 py-1 rounded-full bg-surface2 border border-border/25 text-[10px] font-bold text-text-muted">✓ License Checked</span>
            <span className="px-3 py-1 rounded-full bg-surface2 border border-border/25 text-[10px] font-bold text-text-muted">✓ No App Required</span>
          </div>
        </div>
      </section>

      {/* ═══════════ FORM SECTION ═══════════ */}
      <main className="relative z-10 flex-1 -mt-8">
        <div className="max-w-xl mx-auto px-4 sm:px-6 pb-20">
          <form onSubmit={handleBookingSubmit}>
            <div className="bg-card/95 backdrop-blur-md border border-border/25 rounded-3xl shadow-2xl overflow-hidden relative p-6 sm:p-8 space-y-6">
              
              <div className="flex items-center gap-3 border-b border-border/10 pb-4">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/25 to-primary/10 border border-primary/15 flex items-center justify-center">
                  <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">Fill Booking Details</h2>
                  <p className="text-[10px] text-text-muted">Fill out the information below to summon your driver</p>
                </div>
                <a href="tel:+919717498198" className="ml-auto bg-gradient-to-r from-primary to-primary-foreground/10 text-white dark:text-black font-extrabold text-xs px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform whitespace-nowrap shadow-md shadow-primary/20">
                  📞 Call Us
                </a>
              </div>

              {/* Name */}
              <InputField label="Your Name" error={errors.custName}>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className={cn(inputBase, errors.custName && 'border-rose-500/50')}
                />
              </InputField>

              {/* Phone */}
              <InputField label="WhatsApp Number" error={errors.custPhone}>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneVal}
                    onChange={(e) => setPhoneVal(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    className={cn(inputBase, errors.custPhone && 'border-rose-500/50')}
                  />
                </div>
                <p className="secure-note text-[10px] text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
                  <span>🔒</span> Your personal info is secured and will not be shared with anyone.
                </p>
              </InputField>

              {/* Trip Type Tabs */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-foreground/70 tracking-[0.08em] uppercase">Trip Type</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'oneway', label: 'One Way', icon: '➡️' },
                    { id: 'roundtrip', label: 'Round Trip', icon: '🔄' },
                    { id: 'monthly', label: 'Monthly', icon: '📅' },
                    { id: 'outstation', label: 'Outstation', icon: '🛣️' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setTripType(tab.id as TripType)
                        setErrors({})
                      }}
                      className={cn(
                        'py-3.5 px-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 font-bold text-xs cursor-pointer',
                        tripType === tab.id
                          ? tab.id === 'outstation'
                            ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                            : 'border-primary bg-primary/10 text-primary'
                          : 'border-border/20 bg-surface2 text-text-muted hover:border-border/40 hover:bg-surface2/80'
                      )}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Car Type Grid */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-extrabold text-foreground/70 tracking-[0.08em] uppercase">Car Type</label>
                  {errors.carType && <span className="text-[10px] text-rose-400 font-semibold">{errors.carType}</span>}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'hatchback', label: 'Hatchback', icon: '🚗', eg: 'Alto, WagonR, i20' },
                    { id: 'sedan', label: 'Sedan', icon: '🚙', eg: 'Dzire, Ciaz, Amaze' },
                    { id: 'suv', label: 'SUV', icon: '🚐', eg: 'Innova, Ertiga, Creta' },
                    { id: 'luxury', label: 'Luxury', icon: '🏎️', eg: 'BMW, Audi, Mercedes' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setCarType(v.id as CarType)
                        if (errors.carType) {
                          setErrors((prev) => {
                            const copy = { ...prev }; delete copy.carType; return copy
                          })
                        }
                      }}
                      className={cn(
                        'p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group',
                        carType === v.id
                          ? 'border-primary bg-primary/10 text-primary shadow-md shadow-primary/5'
                          : 'border-border/20 bg-surface2 text-text-muted hover:border-border/40 hover:bg-surface2/80'
                      )}
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-300 mb-1">{v.icon}</span>
                      <span className="font-extrabold text-xs">{v.label}</span>
                      <span className="text-[9px] font-normal opacity-70 mt-0.5">{v.eg}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── CONDITIONAL GROUPS ── */}

              {/* 1. ONE WAY GROUP */}
              {tripType === 'oneway' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="relative pl-6 border-l-2 border-dashed border-primary/40 space-y-4">
                    <div className="absolute -left-[5px] top-4 h-2 w-2 rounded-full bg-primary" />
                    <InputField label="Pickup Location" error={errors.pickup}>
                      <input
                        type="text"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="e.g. Sector 29, Gurgaon"
                        className={cn(inputBase, errors.pickup && 'border-rose-500/50')}
                      />
                    </InputField>

                    <div className="absolute -left-[5px] bottom-14 h-2 w-2 rounded-full bg-rose-500" />
                    <InputField label="Drop Location" error={errors.drop}>
                      <input
                        type="text"
                        value={drop}
                        onChange={(e) => setDrop(e.target.value)}
                        placeholder="e.g. Cyber City, DLF Phase 2"
                        className={cn(inputBase, errors.drop && 'border-rose-500/50')}
                      />
                    </InputField>
                  </div>

                  <InputField label="Estimated Distance" error={errors.estKms}>
                    <select
                      value={estKms || ''}
                      onChange={(e) => setEstKms(Number(e.target.value))}
                      className={cn(inputBase, errors.estKms && 'border-rose-500/50')}
                    >
                      <option value="">— Select Distance —</option>
                      {[10, 15, 20, 25, 30, 35, 40, 50, 55, 60].map((val) => (
                        <option key={val} value={val}>{val} km</option>
                      ))}
                    </select>
                  </InputField>
                </div>
              )}

              {/* 2. ROUND TRIP GROUP */}
              {tripType === 'roundtrip' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <InputField label="Total Hours Required" error={errors.roundHours}>
                    <input
                      type="number"
                      value={roundHours || ''}
                      onChange={(e) => setRoundHours(Number(e.target.value))}
                      placeholder="e.g. 4 (min 2 hours)"
                      min="2"
                      max="24"
                      className={cn(inputBase, errors.roundHours && 'border-rose-500/50')}
                    />
                  </InputField>

                  <div className="grid grid-cols-2 gap-4 bg-surface2/50 border border-border/10 rounded-2xl p-4">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-extrabold text-text-muted uppercase tracking-wider">📍 Live Location</span>
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={capturingLocation}
                        className={cn(
                          'w-full py-2.5 rounded-xl border border-dashed border-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-primary/5 transition-all duration-300',
                          locationCaptured && 'border-solid border-emerald-500 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15'
                        )}
                      >
                        {capturingLocation ? (
                          <>⏳ Fetching...</>
                        ) : (
                          <>{locationCaptured ? '✅ Location Shared' : '📍 Share Location'}</>
                        )}
                      </button>
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="block text-[10px] font-extrabold text-text-muted uppercase tracking-wider">📌 Status</span>
                      {locationCaptured ? (
                        <div className="flex flex-col items-center sm:items-start justify-center h-9">
                          <span className="text-emerald-500 text-xs font-bold">Captured!</span>
                          <a
                            href={`https://www.google.com/maps?q=${userLat},${userLng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-primary underline font-bold"
                          >
                            View on Map
                          </a>
                        </div>
                      ) : (
                        <span className="block text-xs text-text-muted/60 leading-9">Not shared yet</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. MONTHLY GROUP */}
              {tripType === 'monthly' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-3 items-start">
                    <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-extrabold text-primary">Monthly Contract Interview</h4>
                      <p className="text-[10px] text-text-muted leading-relaxed mt-0.5">
                        We organize a face-to-face trial with the candidate. Select your preferred date & time below.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="🗓 Interview Date" error={errors.interviewDate}>
                      <input
                        type="date"
                        value={interviewDate}
                        onChange={(e) => handleDateTimeChange(e.target.value, interviewTime, 'interview')}
                        className={cn(inputBase, errors.interviewDate && 'border-rose-500/50')}
                      />
                    </InputField>
                    <InputField label="🕐 Start Time" error={errors.interviewTime}>
                      <input
                        type="time"
                        value={interviewTime}
                        onChange={(e) => handleDateTimeChange(interviewDate, e.target.value, 'interview')}
                        className={cn(inputBase, errors.interviewTime && 'border-rose-500/50')}
                      />
                    </InputField>
                  </div>

                  {/* Google Calendar Link Button */}
                  {interviewDate && interviewTime && (
                    <div className="p-3 bg-blue-500/5 border border-blue-500/25 rounded-2xl flex flex-col gap-2 items-center justify-center">
                      <span className="text-[11px] font-bold text-foreground/80 underline decoration-blue-500/65 underline-offset-2">
                        📅 {getNiceDateTime()}
                      </span>
                      <a
                        href={getGoogleCalendarUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/35 hover:bg-blue-500/20 px-4 py-2 rounded-xl text-xs font-bold text-blue-500 shadow-sm transition-all"
                      >
                        📅 Add Interview to Google Calendar
                      </a>
                    </div>
                  )}

                  <InputField label="Working Days per Month" error={errors.monthlyDays}>
                    <input
                      type="number"
                      value={monthlyDays || ''}
                      onChange={(e) => setMonthlyDays(Number(e.target.value))}
                      placeholder="e.g. 26"
                      min="1"
                      max="31"
                      className={cn(inputBase, errors.monthlyDays && 'border-rose-500/50')}
                    />
                  </InputField>

                  <InputField label="Hours per Day" error={errors.monthlyHours}>
                    <input
                      type="number"
                      value={monthlyHours || ''}
                      onChange={(e) => setMonthlyHours(Number(e.target.value))}
                      placeholder="e.g. 10"
                      min="1"
                      max="24"
                      className={cn(inputBase, errors.monthlyHours && 'border-rose-500/50')}
                    />
                  </InputField>

                  {/* Monthly Extra Salary Amount Input */}
                  {monthlyDays > 0 && monthlyHours > 0 && (
                    <InputField label="Extra Amount (Optional)">
                      <div className="flex items-center">
                        <div className="bg-surface2 border-y border-l border-border/30 px-4 py-3.5 rounded-l-xl font-bold text-text-muted text-sm select-none">
                          ₹
                        </div>
                        <input
                          type="number"
                          value={extraAmt || ''}
                          onChange={(e) => setExtraAmt(Number(e.target.value))}
                          placeholder="e.g. 2000"
                          min="0"
                          step="500"
                          className={cn(inputBase, 'rounded-l-none border-l-0')}
                        />
                      </div>
                      <p className="text-[9px] text-text-muted/70 italic">Higher amount = more driver interest = faster recruitment.</p>
                    </InputField>
                  )}
                </div>
              )}

              {/* 4. OUTSTATION GROUP */}
              {tripType === 'outstation' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="out-badge inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-[10px] font-extrabold text-violet-400 uppercase tracking-widest">
                    🛣️ Outstation Booking
                  </div>

                  <div className="space-y-2">
                    <span className="block text-[11px] font-extrabold text-foreground/70 uppercase tracking-wider">Outstation Trip Type</span>
                    <div className="flex gap-2">
                      {[
                        { id: 'oneway', label: '➡️ One Way' },
                        { id: 'roundtrip', label: '🔄 Round Trip' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setOutSubType(mode.id as OutstationType)}
                          className={cn(
                            'flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all duration-300 cursor-pointer',
                            outSubType === mode.id
                              ? 'border-violet-500 bg-violet-500/10 text-violet-400 shadow-md shadow-violet-500/5'
                              : 'border-border/20 bg-surface2 text-text-muted hover:border-border/40 hover:bg-surface2/80'
                          )}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pickup City/Location - UX Improvement: Always visible for Outstation */}
                  <InputField label="Pickup City / Location" error={errors.outPickup}>
                    <input
                      type="text"
                      value={outPickup}
                      onChange={(e) => setOutPickup(e.target.value)}
                      placeholder="e.g. Connaught Place, Delhi"
                      className={cn(inputBase, errors.outPickup && 'border-rose-500/50')}
                    />
                  </InputField>

                  {/* Subtype conditional inputs */}
                  {outSubType === 'oneway' ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <InputField label="Drop City / Location" error={errors.outDrop}>
                        <input
                          type="text"
                          value={outDrop}
                          onChange={(e) => setOutDrop(e.target.value)}
                          placeholder="e.g. Jaipur, Rajasthan"
                          className={cn(inputBase, errors.outDrop && 'border-rose-500/50')}
                        />
                      </InputField>

                      <InputField label="Estimated Distance (One Way)" error={errors.outKms}>
                        <select
                          value={outKms || ''}
                          onChange={(e) => setOutKms(Number(e.target.value))}
                          className={cn(inputBase, errors.outKms && 'border-rose-500/50')}
                        >
                          <option value="">— Select Distance —</option>
                          {[100, 150, 200, 250, 300, 350, 400].map((val) => (
                            <option key={val} value={val}>{val} km</option>
                          ))}
                        </select>
                      </InputField>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <InputField label="Destination City" error={errors.outDest}>
                        <input
                          type="text"
                          value={outDest}
                          onChange={(e) => setOutDest(e.target.value)}
                          placeholder="e.g. Agra, Taj Mahal"
                          className={cn(inputBase, errors.outDest && 'border-rose-500/50')}
                        />
                      </InputField>

                      <InputField label="Number of Days" error={errors.outDays}>
                        <input
                          type="number"
                          value={outDays || ''}
                          onChange={(e) => setOutDays(Number(e.target.value))}
                          placeholder="e.g. 2"
                          min="1"
                          max="30"
                          className={cn(inputBase, errors.outDays && 'border-rose-500/50')}
                        />
                      </InputField>
                    </div>
                  )}
                </div>
              )}

              {/* Optional GPS Location component for OneWay, Outstation, Monthly */}
              {tripType !== 'roundtrip' && (
                <InputField label="📍 Share Your Location (Optional)">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={capturingLocation}
                    className={cn(
                      'w-full py-3 border border-dashed border-primary hover:bg-primary/5 text-primary text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                      locationCaptured && 'border-solid border-emerald-500 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15'
                    )}
                  >
                    <Compass className={cn('h-4 w-4', capturingLocation && 'animate-spin')} />
                    {capturingLocation ? 'Capturing Location...' : locationCaptured ? '✅ Location Captured!' : 'Tap to share current location'}
                  </button>
                  {locationCaptured && (
                    <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/25 rounded-xl p-3.5 animate-in slide-in-from-top-1 text-xs">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        ✅ Captured (Lat: {userLat}, Lng: {userLng})
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${userLat},${userLng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary font-bold underline"
                      >
                        View Map
                      </a>
                    </div>
                  )}
                  <p className="text-[9px] text-text-muted/70">Helps us dispatch the nearest driver faster.</p>
                </InputField>
              )}

              {/* Booking Date & Time (for non-monthly trips) */}
              {tripType !== 'monthly' && (
                <InputField label="Date & Time" error={errors.bookDate || errors.bookTime}>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={bookDate}
                      onChange={(e) => handleDateTimeChange(e.target.value, bookTime, 'book')}
                      className={cn(inputBase, errors.bookDate && 'border-rose-500/50')}
                    />
                    <input
                      type="time"
                      value={bookTime}
                      onChange={(e) => handleDateTimeChange(bookDate, e.target.value, 'book')}
                      className={cn(inputBase, errors.bookTime && 'border-rose-500/50')}
                    />
                  </div>
                </InputField>
              )}

              {/* Pickup for non-oneway local/monthly trips (RT, Monthly and Outstation RoundTrip need it) */}
              {(tripType === 'roundtrip' || tripType === 'monthly') && (
                <InputField label="Pickup Location" error={errors.pickupCommon}>
                  <input
                    type="text"
                    value={pickupCommon}
                    onChange={(e) => setPickupCommon(e.target.value)}
                    placeholder="e.g. Sector 29, Gurgaon"
                    className={cn(inputBase, errors.pickupCommon && 'border-rose-500/50')}
                  />
                </InputField>
              )}

              {/* Comments */}
              <InputField label="Additional Comments (Optional)">
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Any special requests, automatic or manual transmission, preferred language..."
                  rows={3}
                  className="w-full px-4 py-3.5 bg-surface2 border border-border/30 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-surface focus:outline-none transition-all duration-300 text-sm text-foreground placeholder:text-text-muted/60 placeholder:italic resize-none"
                />
              </InputField>

              <div className="border-t border-border/10 pt-4" />

              {/* ─── LIVE PREVIEW CARD ─── */}
              {(customerName || phoneVal || carType || pickup || pickupCommon || outPickup) && (
                <div className="bg-emerald-500/[0.03] dark:bg-emerald-500/[0.015] border border-emerald-500/20 rounded-2xl p-5 animate-in fade-in duration-300 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" /> Live Summary Preview
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Name</span>
                      <span className="font-semibold text-foreground truncate">{customerName || '—'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Phone</span>
                      <span className="font-semibold text-foreground">{phoneVal ? `+91 ${phoneVal}` : '—'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Trip Type</span>
                      <span className="font-semibold text-foreground capitalize">
                        {tripType === 'outstation'
                          ? `Outstation (${outSubType === 'oneway' ? 'One Way' : 'Round Trip'})`
                          : tripType === 'oneway'
                            ? 'One Way'
                            : tripType === 'roundtrip'
                              ? 'Round Trip'
                              : 'Monthly'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Car Type</span>
                      <span className="font-semibold text-foreground capitalize">{carType || '—'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Pickup</span>
                      <span className="font-semibold text-foreground truncate">
                        {tripType === 'oneway'
                          ? pickup
                          : tripType === 'roundtrip' || tripType === 'monthly'
                            ? pickupCommon
                            : outPickup || '—'}
                      </span>
                    </div>
                    {tripType === 'oneway' && (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Drop</span>
                        <span className="font-semibold text-foreground truncate">{drop || '—'}</span>
                      </div>
                    )}
                    {tripType === 'outstation' && outSubType === 'oneway' && (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Drop</span>
                        <span className="font-semibold text-foreground truncate">{outDrop || '—'}</span>
                      </div>
                    )}
                    {tripType === 'outstation' && outSubType === 'roundtrip' && (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Destination</span>
                        <span className="font-semibold text-foreground truncate">{outDest || '—'}</span>
                      </div>
                    )}
                    <div className="flex flex-col col-span-2">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Date & Time</span>
                      <span className="font-semibold text-foreground">{getNiceDateTime()}</span>
                    </div>
                  </div>

                  {/* Realtime Fare/Salary Box */}
                  {(amount || note) && (
                    <div className="bg-slate-900/95 dark:bg-black/85 rounded-xl p-4 flex flex-col gap-1.5 text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {tripType === 'monthly' ? '💰 Estimated Salary' : '💰 Estimated Fare'}
                        </span>
                        <span className="text-2xl font-bold text-primary font-mono">
                          {totalFare ? `₹${totalFare.toLocaleString('en-IN')}` : '—'}
                        </span>
                      </div>

                      {/* Monthly breakdowns */}
                      {tripType === 'monthly' && monthlyDays > 0 && monthlyHours > 0 && (
                        <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 space-y-1">
                          <p>📅 Package: {monthlyDays} days × {monthlyHours} hrs/day</p>
                          <p>💼 Base Salary: ₹{calcMonthlyPriceVal(monthlyDays, monthlyHours).amount.toLocaleString('en-IN')}</p>
                          {extraAmt > 0 && <p className="text-primary">➕ Extra Interest Amt: +₹{extraAmt.toLocaleString('en-IN')}</p>}
                        </div>
                      )}

                      {/* Night Allowance Indicator */}
                      {tripType !== 'monthly' && nightCharge > 0 && (
                        <div className="text-[10px] text-primary flex items-center gap-1">
                          <span>🌙</span> Includes ₹200 Night Travel Allowance (10PM–6AM)
                        </div>
                      )}

                      <p className="text-[9.5px] text-slate-500 leading-normal border-t border-slate-800/60 pt-1.5 italic font-medium">{note}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  'w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-98 hover:-translate-y-0.5 transition-all',
                  submitting && 'opacity-65 cursor-not-allowed pointer-events-none'
                )}
              >
                {submitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="h-4.5 w-4.5" />
                    Send Booking on WhatsApp
                  </>
                )}
              </button>
              <div className="text-center text-[10px] text-text-muted font-bold">
                Your details will be sent to our team via WhatsApp instantly.
              </div>
            </div>
          </form>

          {/* ═══════════ TERMS & CONDITIONS CARD ═══════════ */}
          <div className="bg-card border border-border/15 rounded-3xl p-6 mt-8 shadow-xl space-y-6">
            
            {/* dynamic prices & charges */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                <span>💰</span> Pricing & Extra Charges
              </h3>
              
              <div className="space-y-2.5">
                {tripType === 'oneway' && (
                  <>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span><strong>₹10 per km</strong> extra if actual distance exceeds your booked KM limit.</span>
                    </div>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span>Waiting period: <strong>₹2 per minute</strong> (after a 15-minute start delay exception).</span>
                    </div>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span>Driver return charges are <strong>already included</strong> in the package.</span>
                    </div>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span><strong>₹200 Night Travel Allowance (NTA)</strong> applicable between 10:00 PM – 6:00 AM.</span>
                    </div>
                  </>
                )}

                {tripType === 'roundtrip' && (
                  <>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span><strong>₹2.5 per minute</strong> to be charged if travel time exceeds booked hours.</span>
                    </div>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span><strong>₹200 Night Travel Allowance (NTA)</strong> applicable between 10:00 PM – 6:00 AM.</span>
                    </div>
                  </>
                )}

                {tripType === 'outstation' && (
                  <>
                    {outSubType === 'oneway' ? (
                      <>
                        <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                          <span className="h-5 w-5 bg-violet-500/10 border border-violet-500/25 text-violet-400 rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                          <span>Driver return fare is <strong>already included</strong> in the package — no extra return amount.</span>
                        </div>
                        <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                          <span className="h-5 w-5 bg-violet-500/10 border border-violet-500/25 text-violet-400 rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                          <span><strong>₹10 per km</strong> extra if actual distance exceeds your booked KM limit.</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                          <span className="h-5 w-5 bg-violet-500/10 border border-violet-500/25 text-violet-400 rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                          <span>Price calculated for maximum <strong>12 hours</strong> — if exceeded, <strong>₹2 per minute</strong> extra on same day.</span>
                        </div>
                        <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                          <span className="h-5 w-5 bg-violet-500/10 border border-violet-500/25 text-violet-400 rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                          <span>If next day added, additional day package price will be appended to your billing.</span>
                        </div>
                      </>
                    )}
                  </>
                )}

                {tripType === 'monthly' && (
                  <>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span>Prices shown are <strong>minimum salary</strong> — final salary decided by you at interview.</span>
                    </div>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span>Available packages: 22 / 24 / 26 days × 8 / 10 / 12 hours per day.</span>
                    </div>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span><strong>₹200 Night Travel Allowance (NTA)</strong> applicable between 10:00 PM – 6:00 AM.</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-border/10" />

            {/* key pointers */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                <span>📌</span> Key Pointers
              </h3>

              <div className="space-y-2.5">
                {tripType !== 'monthly' && (
                  <>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span>Nearby verified driver at your doorstep within <strong>60 minutes</strong>.</span>
                    </div>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span>All drivers are experienced and background verified.</span>
                    </div>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span><strong>Pay at the end of the trip</strong> — no advance needed.</span>
                    </div>
                  </>
                )}

                {tripType === 'oneway' && (
                  <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                    <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                    <span>No need to provide food or travel expenses to the driver.</span>
                  </div>
                )}

                {tripType === 'roundtrip' && (
                  <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                    <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                    <span>No need to provide food or travel expenses to the driver.</span>
                  </div>
                )}

                {tripType === 'outstation' && (
                  <>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-violet-500/10 border border-violet-500/25 text-violet-400 rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span><strong>₹200 Night Travel Allowance (NTA)</strong> applicable between 10:00 PM – 6:00 AM.</span>
                    </div>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-violet-500/10 border border-violet-500/25 text-violet-400 rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span><strong>Food & stay charges will be levied to the customer</strong> for outstation trips.</span>
                    </div>
                    {outSubType === 'oneway' ? (
                      <>
                        <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                          <span className="h-5 w-5 bg-violet-500/10 border border-violet-500/25 text-violet-400 rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                          <span>Customer's responsibility to provide conveyance fare to the nearest bus stand/railway station when trip ends.</span>
                        </div>
                        <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                          <span className="h-5 w-5 bg-violet-500/10 border border-violet-500/25 text-violet-400 rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                          <span>One-way driver food to be managed by Customer.</span>
                        </div>
                      </>
                    ) : null}
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-violet-500/10 border border-violet-500/25 text-violet-400 rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span><strong>Pay at the end of the trip</strong> — no advance needed.</span>
                    </div>
                  </>
                )}

                {tripType === 'monthly' && (
                  <>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span>All drivers are experienced and background verified.</span>
                    </div>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span><strong>Final salary to be decided by you in the Interview.</strong></span>
                    </div>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span>Driver will be available for the agreed hours every day.</span>
                    </div>
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed">
                      <span className="h-5 w-5 bg-primary/15 border border-primary/25 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">✓</span>
                      <span><strong>Monthly salary to be credited by you directly</strong> to the driver.</span>
                    </div>
                    <div className="flex gap-2.5 items-start p-3.5 bg-primary/10 border border-primary/30 rounded-xl text-xs text-primary font-bold animate-pulse">
                      <span className="shrink-0 text-sm">📩</span>
                      <span>A proposal will be sent to you on WhatsApp / Email with candidate driver profiles.</span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

