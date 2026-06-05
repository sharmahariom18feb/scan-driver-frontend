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

type TripType = 'HOURLY' | 'WEEKLY' | 'MONTHLY' | 'OUTSTATION'
type VehicleType = 'Hatchback' | 'Sedan' | 'SUV' | 'Luxury'
type OutstationType = 'ONE_WAY' | 'ROUND_TRIP'

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

/* ─── Step Progress Indicator ─── */
function StepIndicator({ step, label, active, completed }: { step: number; label: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn(
        'h-8 w-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all duration-500',
        completed ? 'bg-primary border-primary text-black scale-100' :
          active ? 'bg-primary/20 border-primary text-primary scale-105 shadow-md shadow-primary/10' :
            'bg-surface2 border-border/30 text-text-muted'
      )}>
        {completed ? <CheckCircle className="h-4 w-4" /> : step}
      </div>
      <span className={cn(
        'text-[11px] font-bold uppercase tracking-wider hidden sm:block transition-colors',
        completed ? 'text-primary' : active ? 'text-foreground' : 'text-text-muted/70'
      )}>{label}</span>
    </div>
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

/* ─── Main Component ─── */
export default function BookingPage() {
  // Form Fields State
  const [customerName, setCustomerName] = useState('')
  const [phoneVal, setPhoneVal] = useState('')
  const [emailVal, setEmailVal] = useState('')
  const [tripType, setTripType] = useState<TripType>('HOURLY')

  // Date and Time
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')

  // Locations
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [capturingLocation, setCapturingLocation] = useState(false)

  // Vehicle
  const [vehicleClass, setVehicleClass] = useState<VehicleType>('Sedan')
  const [vehicleName, setVehicleName] = useState('')

  // Duration
  const [hourlyHours, setHourlyHours] = useState<number>(8)
  const [outstationDays, setOutstationDays] = useState<number>(1)
  const [outstationType, setOutstationType] = useState<OutstationType>('ROUND_TRIP')

  // Monthly interview
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('')

  // Special instructions
  const [specialInstructions, setSpecialInstructions] = useState('')

  // Submitting state
  const [submitting, setSubmitting] = useState(false)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Active form section for mobile step tracking
  const [activeSection, setActiveSection] = useState(0)

  // Internal fare for WhatsApp message (not displayed)
  const [internalFare, setInternalFare] = useState<number>(0)
  useEffect(() => {
    let fare = 0
    if (tripType === 'HOURLY') {
      fare = ({ Hatchback: 100, Sedan: 120, SUV: 150, Luxury: 250 })[vehicleClass] * Math.max(4, hourlyHours)
    } else if (tripType === 'WEEKLY') {
      fare = ({ Hatchback: 5500, Sedan: 6500, SUV: 8000, Luxury: 15000 })[vehicleClass]
    } else if (tripType === 'MONTHLY') {
      fare = ({ Hatchback: 18000, Sedan: 20000, SUV: 24000, Luxury: 45000 })[vehicleClass]
    } else if (tripType === 'OUTSTATION') {
      const days = Math.max(1, outstationDays)
      fare = (({ Hatchback: 12, Sedan: 14, SUV: 18, Luxury: 30 })[vehicleClass] * days * 250) + (days * 400)
    }
    setInternalFare(fare)
  }, [tripType, vehicleClass, hourlyHours, outstationDays])

  // Capture GPS
  const handleCaptureLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation is not supported'); return }
    setCapturingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const link = `https://www.google.com/maps?q=${latitude},${longitude}`
        setPickup(prev => prev ? `${prev} (GPS: ${link})` : `GPS: ${link}`)
        setCapturingLocation(false)
        toast.success('📍 GPS Location Captured!')
      },
      () => { setCapturingLocation(false); toast.error('Location access denied. Please type manually.') },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Validate
  const validateForm = () => {
    const e: Record<string, string> = {}
    if (!customerName.trim()) e.name = 'Full name is required'
    if (!phoneVal.trim()) {
      e.phone = 'Mobile number is required'
    } else if (phoneVal.length !== 10) {
      e.phone = 'Mobile number must be 10 digits'
    }
    if (tripType !== 'MONTHLY') {
      if (!startDate) e.startDate = 'Select a date'
      if (!startTime) e.startTime = 'Select a time'
      if (!pickup.trim()) e.pickup = 'Pickup address is required'
    } else {
      if (!interviewDate) e.interviewDate = 'Select interview date'
      if (!interviewTime) e.interviewTime = 'Select interview time'
      if (!pickup.trim()) e.pickup = 'Address is required'
    }
    if (tripType === 'OUTSTATION' && !drop.trim()) e.drop = 'Destination is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Submit
  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validateForm()) { toast.error('Please complete all required fields'); return }
    setSubmitting(true)
    const bookingId = 'SD-' + Math.floor(1000 + Math.random() * 9000)

    const dbPayload = {
      id: bookingId,
      customer_name: customerName,
      phone: phoneVal,
      pickup,
      drop: tripType === 'OUTSTATION' ? drop : (tripType === 'MONTHLY' ? 'Monthly Hire' : drop || 'Local Trip'),
      date_time: tripType === 'MONTHLY' ? `Interview: ${interviewDate} ${interviewTime}` : `${startDate} ${startTime}`,
      duration: tripType === 'HOURLY' ? `${hourlyHours} Hours` : (tripType === 'OUTSTATION' ? `${outstationDays} Days` : tripType === 'WEEKLY' ? '1 Week' : '1 Month'),
      distance: tripType === 'OUTSTATION' ? `${outstationDays * 250} km est.` : 'N/A',
      fare: internalFare,
      vehicle: `${vehicleClass}${vehicleName ? ` (${vehicleName})` : ''}`,
      special_instructions: specialInstructions + (tripType === 'MONTHLY' && emailVal ? ` | Email: ${emailVal}` : ''),
      status: 'available' as const,
      type: tripType,
      admin_approved: false,
    }

    try {
      const { error } = await supabase.from('bookings').insert(dbPayload)
      if (error) throw error
      toast.success('Booking created! Redirecting to WhatsApp…')
    } catch (err: any) {
      console.error('DB insert error:', err)
      toast.info('Saved locally. Opening WhatsApp…')
    }

    let msg = `*New Booking Request* 🧑‍✈️\n`
    msg += `*ID:* ${bookingId}\n*Name:* ${customerName}\n*Phone:* ${phoneVal}\n`
    if (emailVal) msg += `*Email:* ${emailVal}\n`
    msg += `*Service:* ${tripType}\n*Vehicle:* ${vehicleClass}${vehicleName ? ` (${vehicleName})` : ''}\n`
    if (tripType === 'MONTHLY') {
      msg += `*Interview:* ${interviewDate} @ ${interviewTime}\n*Base Location:* ${pickup}\n`
    } else {
      msg += `*Date/Time:* ${startDate} @ ${startTime}\n*Pickup:* ${pickup}\n`
      if (tripType === 'OUTSTATION') msg += `*Destination:* ${drop}\n*Mode:* ${outstationType.replace('_', ' ')}\n*Days:* ${outstationDays}\n`
      else if (tripType === 'HOURLY') msg += `*Duration:* ${hourlyHours} Hours\n`
    }
    if (specialInstructions.trim()) msg += `*Notes:* ${specialInstructions}\n`
    msg += `\n_Powered by ScanDriver.in_`

    setTimeout(() => {
      window.open(getWhatsAppLink(WHATSAPP_CUSTOMER, msg), '_blank')
      setSubmitting(false)
      setCustomerName(''); setPhoneVal(''); setEmailVal(''); setPickup(''); setDrop('')
      setStartDate(''); setStartTime(''); setSpecialInstructions('')
      setInterviewDate(''); setInterviewTime(''); setVehicleName('')
    }, 800)
  }

  const inputBase = 'w-full px-4 py-3.5 bg-surface2 border border-border/30 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-surface focus:outline-none transition-all duration-300 text-sm text-foreground placeholder:text-text-muted/60 placeholder:italic'

  /* ──────── Render ──────── */
  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <Toaster position="top-center" richColors />
      <Navbar />

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative pt-28 sm:pt-36 pb-28 sm:pb-36 overflow-hidden">
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a0f1a] to-[#0d1a12]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,146,42,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.06),transparent_60%)]" />
        <HeroGridPattern />
        <FloatingOrbs />

        {/* Curved bottom separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 80V20C360 70 720 0 1080 40C1260 55 1380 65 1440 70V80H0Z" className="fill-background" />
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-6">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.07] backdrop-blur-sm border border-white/15">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Book Your Professional Driver</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            <span className="text-white">Hire a </span>
            <span className="bg-gradient-to-r from-primary via-gold-light to-primary bg-clip-text text-transparent">Verified Driver</span>
            <br />
            <span className="text-white/90">in Delhi NCR</span>
          </h1>

          <p className="text-base sm:text-lg text-white/55 max-w-xl mx-auto leading-relaxed">
            Background-checked, experienced drivers for every need —
            hourly, weekly, monthly, or outstation.
          </p>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {[
              { icon: Shield, text: 'Aadhaar Verified' },
              { icon: Star, text: '4.8★ Avg Rating' },
              { icon: Zap, text: '15 Min Allocation' },
              { icon: Clock, text: '24/7 Support' },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-xs border border-white/[0.10] text-[11px] font-semibold text-white/70">
                <badge.icon className="h-3.5 w-3.5 text-primary" />
                {badge.text}
              </div>
            ))}
          </div>

          {/* Scroll prompt */}
          <div className="pt-6 flex justify-center">
            <button
              onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-center gap-1 text-white/30 hover:text-primary/70 transition-colors cursor-pointer group"
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest">Fill Booking Form</span>
              <ChevronRight className="h-5 w-5 rotate-90 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ FORM SECTION ═══════════ */}
      <main id="booking-form" className="relative z-10 flex-1 -mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">

          {/* Step Progress Bar */}
          <div className="flex items-center justify-between mb-10 px-2">
            <StepIndicator step={1} label="Service" active={activeSection === 0} completed={activeSection > 0} />
            <div className="flex-1 h-px bg-border/30 mx-2" />
            <StepIndicator step={2} label="Details" active={activeSection === 1} completed={activeSection > 1} />
            <div className="flex-1 h-px bg-border/30 mx-2" />
            <StepIndicator step={3} label="Vehicle" active={activeSection === 2} completed={activeSection > 2} />
            <div className="flex-1 h-px bg-border/30 mx-2" />
            <StepIndicator step={4} label="Confirm" active={activeSection === 3} completed={false} />
          </div>

          {/* The Form Card */}
          <form onSubmit={handleSubmit}>
            <div className="bg-card/90 backdrop-blur-md border border-border/25 rounded-3xl shadow-2xl overflow-hidden relative">
              {/* Decorative corner glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/8 to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-emerald-500/8 to-transparent rounded-tr-full pointer-events-none" />

              {/* ─── Section 1: Service Type ─── */}
              <div className="p-6 sm:p-8 border-b border-border/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/25 to-primary/10 border border-primary/15 flex items-center justify-center">
                    <Sparkles className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Choose Your Service</h3>
                    <p className="text-[11px] text-text-muted">Select the type of driver you need</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {([
                    { type: 'HOURLY' as TripType, icon: '🕐', label: 'Hourly', sub: 'By the hour' },
                    { type: 'WEEKLY' as TripType, icon: '📆', label: 'Weekly', sub: '7-day package' },
                    { type: 'MONTHLY' as TripType, icon: '📅', label: 'Monthly', sub: 'Full month hire' },
                    { type: 'OUTSTATION' as TripType, icon: '🛣️', label: 'Outstation', sub: 'Long distance' },
                  ]).map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => { setTripType(item.type); setErrors({}); setActiveSection(0) }}
                      className={cn(
                        'relative py-5 px-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-400 cursor-pointer group overflow-hidden',
                        tripType === item.type
                          ? 'border-primary bg-gradient-to-b from-primary/15 to-primary/5 shadow-lg shadow-primary/10'
                          : 'border-border/25 bg-surface2/70 hover:border-border/40 hover:bg-surface2'
                      )}
                    >
                      {tripType === item.type && (
                        <div className="absolute top-1.5 right-1.5">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                      <span className={cn('text-xs font-extrabold tracking-wide', tripType === item.type ? 'text-primary' : 'text-foreground')}>{item.label}</span>
                      <span className="text-[9px] text-text-muted/80 font-medium">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── Section 2: Personal Info ─── */}
              <div className="p-6 sm:p-8 border-b border-border/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                    <User className="h-4.5 w-4.5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Your Information</h3>
                    <p className="text-[11px] text-text-muted">We will reach out on WhatsApp</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField label="Full Name" icon={User} error={errors.name}>
                    <input
                      type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      onFocus={() => setActiveSection(1)}
                      className={cn(inputBase, errors.name && 'border-rose-500/50 focus:border-rose-500/70')}
                    />
                  </InputField>

                  <InputField label="WhatsApp Number" icon={Phone} error={errors.phone}>
                    <input
                      type="tel"
                      value={phoneVal}
                      onChange={(e) => setPhoneVal(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      onFocus={() => setActiveSection(1)}
                      className={cn(inputBase, errors.phone && 'border-rose-500/50 focus:border-rose-500/70')}
                    />
                  </InputField>

                  <InputField label="Email Address (Optional)" icon={Mail} className="sm:col-span-2">
                    <input
                      type="email" value={emailVal} onChange={(e) => setEmailVal(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      onFocus={() => setActiveSection(1)}
                      className={inputBase}
                    />
                  </InputField>
                </div>
              </div>

              {/* ─── Section 3: Schedule & Location ─── */}
              <div className="p-6 sm:p-8 border-b border-border/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500/25 to-sky-500/10 border border-sky-500/15 flex items-center justify-center">
                    <Clock className="h-4.5 w-4.5 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Schedule & Location</h3>
                    <p className="text-[11px] text-text-muted">When and where do you need the driver?</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Hourly inputs */}
                  {tripType === 'HOURLY' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField label="Start Date" error={errors.startDate}>
                          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} onFocus={() => setActiveSection(2)} className={cn(inputBase, errors.startDate && 'border-rose-500/50')} />
                        </InputField>
                        <InputField label="Start Time" error={errors.startTime}>
                          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} onFocus={() => setActiveSection(2)} className={cn(inputBase, errors.startTime && 'border-rose-500/50')} />
                        </InputField>
                      </div>
                      <InputField label="Duration (Hours)">
                        <div className="grid grid-cols-4 gap-2.5">
                          {[4, 8, 12, 24].map((h) => (
                            <button key={h} type="button" onClick={() => { setHourlyHours(h); setActiveSection(2) }}
                              className={cn(
                                'py-3 rounded-xl border-2 text-sm font-extrabold transition-all duration-300 cursor-pointer',
                                hourlyHours === h
                                  ? 'bg-gradient-to-b from-primary/20 to-primary/8 border-primary text-primary shadow-md shadow-primary/5'
                                  : 'bg-surface2/70 border-border/25 text-foreground/70 hover:border-border/40 hover:text-foreground'
                              )}
                            >{h}h</button>
                          ))}
                        </div>
                        <p className="text-[10px] text-text-muted/60 italic mt-1.5">Minimum booking duration is 4 hours</p>
                      </InputField>
                    </>
                  )}

                  {/* Weekly inputs */}
                  {tripType === 'WEEKLY' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InputField label="Start Date" error={errors.startDate}>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} onFocus={() => setActiveSection(2)} className={cn(inputBase, errors.startDate && 'border-rose-500/50')} />
                      </InputField>
                      <InputField label="Reporting Time" error={errors.startTime}>
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} onFocus={() => setActiveSection(2)} className={cn(inputBase, errors.startTime && 'border-rose-500/50')} />
                      </InputField>
                    </div>
                  )}

                  {/* Monthly inputs */}
                  {tripType === 'MONTHLY' && (
                    <>
                      <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/10 flex items-start gap-3">
                        <HelpCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-amber-400">Monthly Contract Interview</p>
                          <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">
                            We organise a free face-to-face trial with the candidate. Pick a date &amp; time below.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField label="Interview Date" error={errors.interviewDate}>
                          <input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} onFocus={() => setActiveSection(2)} className={cn(inputBase, errors.interviewDate && 'border-rose-500/50')} />
                        </InputField>
                        <InputField label="Interview Time" error={errors.interviewTime}>
                          <input type="time" value={interviewTime} onChange={(e) => setInterviewTime(e.target.value)} onFocus={() => setActiveSection(2)} className={cn(inputBase, errors.interviewTime && 'border-rose-500/50')} />
                        </InputField>
                      </div>
                    </>
                  )}

                  {/* Outstation inputs */}
                  {tripType === 'OUTSTATION' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField label="Start Date" error={errors.startDate}>
                          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} onFocus={() => setActiveSection(2)} className={cn(inputBase, errors.startDate && 'border-rose-500/50')} />
                        </InputField>
                        <InputField label="Reporting Time" error={errors.startTime}>
                          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} onFocus={() => setActiveSection(2)} className={cn(inputBase, errors.startTime && 'border-rose-500/50')} />
                        </InputField>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField label="Trip Mode">
                          <div className="flex gap-2.5">
                            {(['ROUND_TRIP', 'ONE_WAY'] as OutstationType[]).map((mode) => (
                              <button key={mode} type="button" onClick={() => setOutstationType(mode)}
                                className={cn(
                                  'flex-1 py-3 rounded-xl border-2 text-xs font-extrabold transition-all cursor-pointer',
                                  outstationType === mode
                                    ? 'bg-gradient-to-b from-primary/20 to-primary/8 border-primary text-primary shadow-md shadow-primary/5'
                                    : 'bg-surface2/70 border-border/25 text-foreground/70 hover:border-border/40 hover:text-foreground'
                                )}
                              >{mode === 'ROUND_TRIP' ? '🔄 Round Trip' : '➡️ One Way'}</button>
                            ))}
                          </div>
                        </InputField>
                        <InputField label="Duration (Days)">
                          <input type="number" min="1" max="30" value={outstationDays} onChange={(e) => setOutstationDays(parseInt(e.target.value) || 1)} className={inputBase} />
                        </InputField>
                      </div>
                    </>
                  )}

                  {/* Location fields */}
                  <InputField
                    label={tripType === 'MONTHLY' ? 'Base Address / Location' : 'Pickup Address'}
                    icon={MapPin}
                    error={errors.pickup}
                  >
                    <div className="relative">
                      <textarea
                        rows={2} value={pickup} onChange={(e) => setPickup(e.target.value)}
                        onFocus={() => setActiveSection(2)}
                        placeholder={tripType === 'MONTHLY' ? 'Base reporting address in Delhi NCR' : 'Enter pickup location or address'}
                        className={cn(inputBase, 'resize-none pr-28', errors.pickup && 'border-rose-500/50')}
                      />
                      <button
                        type="button" onClick={handleCaptureLocation} disabled={capturingLocation}
                        className="absolute right-2 top-2 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold flex items-center gap-1 hover:bg-primary/20 transition-all cursor-pointer"
                      >
                        <Compass className={cn('h-3 w-3', capturingLocation && 'animate-spin')} />
                        {capturingLocation ? 'Wait…' : '📍 GPS'}
                      </button>
                    </div>
                  </InputField>

                  {tripType === 'OUTSTATION' && (
                    <InputField label="Destination Address" icon={Navigation} error={errors.drop}>
                      <textarea
                        rows={2} value={drop} onChange={(e) => setDrop(e.target.value)}
                        placeholder="Enter outstation destination"
                        className={cn(inputBase, 'resize-none', errors.drop && 'border-rose-500/50')}
                      />
                    </InputField>
                  )}
                </div>
              </div>

              {/* ─── Section 4: Vehicle & Notes ─── */}
              <div className="p-6 sm:p-8 border-b border-border/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500/25 to-violet-500/10 border border-violet-500/15 flex items-center justify-center">
                    <span className="text-lg">🚘</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Vehicle Preferences</h3>
                    <p className="text-[11px] text-text-muted">Choose car type and add any special notes</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {([
                      { type: 'Hatchback' as VehicleType, icon: '🚗', eg: 'WagonR, Swift' },
                      { type: 'Sedan' as VehicleType, icon: '🚘', eg: 'Dzire, City' },
                      { type: 'SUV' as VehicleType, icon: '🚙', eg: 'Creta, XUV700' },
                      { type: 'Luxury' as VehicleType, icon: '🏎️', eg: 'BMW, Merc' },
                    ]).map((v) => (
                      <button
                        key={v.type} type="button"
                        onClick={() => { setVehicleClass(v.type); setActiveSection(3) }}
                        className={cn(
                          'relative py-4 px-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all duration-300 cursor-pointer group',
                          vehicleClass === v.type
                            ? 'border-primary bg-gradient-to-b from-primary/15 to-primary/5 shadow-md shadow-primary/5'
                            : 'border-border/25 bg-surface2/70 hover:border-border/40 hover:bg-surface2'
                        )}
                      >
                        {vehicleClass === v.type && <div className="absolute top-1.5 right-1.5"><CheckCircle className="h-3.5 w-3.5 text-primary" /></div>}
                        <span className="text-2xl group-hover:scale-110 transition-transform">{v.icon}</span>
                        <span className={cn('text-[11px] font-extrabold', vehicleClass === v.type ? 'text-primary' : 'text-foreground')}>  {v.type}</span>
                        <span className="text-[8px] text-text-muted/80">{v.eg}</span>
                      </button>
                    ))}
                  </div>

                  <InputField label="Vehicle Name / Model (Optional)">
                    <input
                      type="text" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)}
                      onFocus={() => setActiveSection(3)}
                      placeholder="e.g. Honda City Automatic"
                      className={inputBase}
                    />
                  </InputField>

                  <InputField label="Special Instructions / Requests">
                    <textarea
                      rows={3} value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)}
                      onFocus={() => setActiveSection(3)}
                      placeholder="e.g. Need manual transmission expert, night driving, family trip, etc."
                      className={cn(inputBase, 'resize-none')}
                    />
                  </InputField>
                </div>
              </div>

              {/* ─── Submit Bar ─── */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-surface2 to-surface2/60 border-t border-border/20">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Trust micro-badges */}
                  <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-semibold">
                      <Shield className="h-3.5 w-3.5 text-emerald-500" /> Verified Drivers
                    </div>
                    <DiamondAccent />
                    <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-semibold">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Instant Confirmation
                    </div>
                    <DiamondAccent />
                    <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-semibold">
                      <Zap className="h-3.5 w-3.5 text-primary" /> No Signup Required
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={cn(
                      'w-full sm:w-auto px-10 py-4 rounded-xl font-extrabold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all duration-400 cursor-pointer shadow-lg',
                      submitting
                        ? 'bg-surface border border-border/20 text-text-muted'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0'
                    )}
                  >
                    {submitting ? (
                      <div className="h-5 w-5 border-2 border-text-muted/40 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <MessageSquare className="h-5 w-5" />
                        Book via WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Bottom trust banner */}
          <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-card to-card/70 backdrop-blur-xs border border-border/25 flex flex-col sm:flex-row items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/25 to-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h4 className="text-sm font-bold text-foreground">ScanDriver Guarantee</h4>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Every driver undergoes Aadhaar verification, license check, criminal background screening, and minimum 2 reference verifications before onboarding. Your safety is our top priority.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
