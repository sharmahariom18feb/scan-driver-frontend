'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, User, Shield, Briefcase, FileText, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { AppDispatch, RootState } from '@/redux/store'
import { signupDriver, normalizePhone } from '@/redux/slices/driverSlice'
import { cn } from '@/lib/utils'
import logoSd from '../../../../public/icons/logo-sd.png'
import { supabase } from '@/lib/supabaseClient'

export default function OnboardingPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { loading, error } = useSelector((state: RootState) => state.driver)

  // Steps: 1: Basic Info, 2: Experience & Documents, 3: Availability & Preference, 4: One Last Thing, 5: Success
  const [step, setStep] = useState(1)

  // Step 1: Basic Info
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [zone, setZone] = useState('')

  // Step 2: Experience & Documents
  const [experience, setExperience] = useState('1-3 saal')
  const [licenseStatus, setLicenseStatus] = useState('Haan, valid hai')
  const [documentsAvailable, setDocumentsAvailable] = useState<string[]>([])

  // Step 3: Availability & Preference
  const [availability, setAvailability] = useState('Full Time')
  const [servicePreference, setServicePreference] = useState<string[]>([])
  const [vehicleSpecialties, setVehicleSpecialties] = useState<string[]>([])

  // Step 4: One Last Thing
  const [previousPlatforms, setPreviousPlatforms] = useState('')
  const [additionalComments, setAdditionalComments] = useState('')

  const [submitting, setSubmitting] = useState(false)

  const zones = [
    'Dwarka & West Delhi',
    'South Delhi',
    'Noida & Greater Noida',
    'Gurgaon (Gurugram)',
    'West Delhi',
    'North Delhi',
    'East Delhi',
    'Ghaziabad',
    'Faridabad'
  ]

  const experienceOptions = [
    { value: '1-3 saal', label: '1–3 saal' },
    { value: '3-5 saal', label: '3–5 saal' },
    { value: '5+ saal', label: '5+ saal', subtext: 'Senior driver' }
  ]

  const licenseOptions = [
    { value: 'Haan, valid hai', label: 'Haan, valid hai', subtext: 'Non-transport / Transport' },
    { value: 'Renew karana hai', label: 'Renew karana hai', subtext: 'Expiry 3 mahinon mein' }
  ]

  const documentOptions = [
    'Aadhaar Card',
    'Driving Licence',
    'Police Verification',
    'PAN Card'
  ]

  const availabilityOptions = [
    { value: 'Full Time', label: 'Full Time', subtext: '6+ ghante roz available' },
    { value: 'Part Time', label: 'Part Time', subtext: 'Morning ya Evening shift' },
    { value: 'Weekend Only', label: 'Weekend Only', subtext: 'Saturday–Sunday' }
  ]

  const serviceOptions = [
    'Hourly Hire',
    'Daily',
    'Weekly',
    'Monthly'
  ]

  const vehicleOptions = ['Hatchback', 'Sedan', 'SUV', 'Luxury / Automatic']

  const handleCheckboxToggle = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, option: string) => {
    if (list.includes(option)) {
      setList(list.filter((item) => item !== option))
    } else {
      setList([...list, option])
    }
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!fullName) {
        toast.error('Please enter your Full Name')
        return
      }
      if (!phone) {
        toast.error('Please enter your mobile number')
        return
      }
      const digits = phone.replace(/\D/g, '')
      if (digits.length !== 10) {
        toast.error('Please enter a valid 10-digit mobile number')
        return
      }
      if (!password) {
        toast.error('Please create an account password')
        return
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters long')
        return
      }
      if (!zone) {
        toast.error('Please select your Area / Zone')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!experience) {
        toast.error('Please select your driving experience')
        return
      }
      if (!licenseStatus) {
        toast.error('Please select your driving licence validity')
        return
      }
      if (documentsAvailable.length === 0) {
        toast.error('Please select at least one document you have available')
        return
      }
      setStep(3)
    } else if (step === 3) {
      if (!availability) {
        toast.error('Please select when you can work')
        return
      }
      setStep(4)
    }
  }

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const normalizedPhone = normalizePhone(phone)

    try {
      // Check if phone already exists via RPC
      const { data: checkData, error: checkError } = await supabase.rpc(
        'check_user_exists_by_email_or_phone',
        {
          p_email: '',
          p_phone: normalizedPhone
        }
      )

      if (checkError) {
        throw new Error(checkError.message || 'Duplication check failed')
      }

      const checkResult = Array.isArray(checkData) ? checkData[0] : checkData
      if (checkResult) {
        if (checkResult.phone_exists) {
          toast.error('An account with this phone number already exists.')
          setSubmitting(false)
          return
        }
      }

      // Step 1: Sign up user
      const result = await dispatch(
        signupDriver({
          fullName,
          phone: normalizedPhone,
          currentArea: zone,
          licenseNo: 'PENDING_VERIFICATION',
          password,
        })
      )

      if (signupDriver.fulfilled.match(result)) {
        const user = result.payload
        if (!user || !user.id) {
          throw new Error('Authentication signup succeeded but returned no profile details')
        }

        // Step 2: Write additional attributes into driver_profiles table
        const { error: profileError } = await supabase
          .from('driver_profiles')
          .insert({
            id: user.id,
            experience,
            license_status: licenseStatus,
            documents_available: documentsAvailable,
            availability,
            service_preference: servicePreference,
            vehicle_specialties: vehicleSpecialties,
            previous_platforms: previousPlatforms || null,
            additional_comments: additionalComments || null
          })

        if (profileError) {
          throw new Error(profileError.message || 'Failed to register additional profile details')
        }

        setStep(5) // success step
        toast.success('Registration completed successfully!')
      } else {
        const errMsg = result.payload as string || 'Registration failed'
        toast.error(errMsg)
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      toast.error(err.message || 'An error occurred during registration')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate Progress Percentage
  const progressPercent = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : step === 4 ? 90 : 100

  return (
    <div className="flex-grow flex flex-col bg-background text-foreground overflow-y-auto driver-app-root">
      <Toaster position="top-center" richColors />

      {/* 1. Header Banner */}
      <header className="relative bg-gradient-to-br from-card/90 to-background px-6 py-6 border-b border-border/10 overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-32 mb-3 flex items-center justify-center">
            <Image src={logoSd} alt="ScanDriver Logo" width={140} className="object-contain" priority />
          </div>
          
          {step < 5 ? (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">
                Become a Driver Partner
              </h2>
              <p className="text-sm text-text-muted mt-1 max-w-[320px]">
                Delhi NCR's trusted driver platform. Sign up to start receiving ride requests near you.
              </p>
              
              <div className="inline-flex items-center gap-1.5 bg-[#A3E635]/10 border border-[#A3E635]/25 text-[#A3E635] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mt-3">
                <Shield size={10} /> 100% Verified Profiles
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-display">
                Registration Successful!
              </h2>
              <p className="text-sm text-text-muted mt-1">
                Your application has been received.
              </p>
            </>
          )}
        </div>
      </header>

      {/* 2. Progress Indicator Bar */}
      {step < 5 && (
        <div className="w-full h-[3px] bg-surface2 relative shrink-0">
          <div 
            className="h-full bg-[#A3E635] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* 3. Steps Body */}
      <main className="flex-grow px-6 py-6 flex flex-col justify-between">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-extrabold tracking-wider text-[#A3E635] uppercase whitespace-nowrap">
                BASIC INFORMATION
              </span>
              <div className="h-[1px] bg-border/20 flex-grow" />
            </div>

            {/* 1. Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-foreground">
                  <span className="text-[#A3E635] font-extrabold mr-1">1</span> Full Name
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#A3E635]/10 border border-[#A3E635]/20 text-[#A3E635]">
                  Required
                </span>
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface2 border border-border/40 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors placeholder:text-text-muted/50"
                placeholder="Jaise aapke Aadhaar mein hai"
              />
            </div>

            {/* 2. WhatsApp Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-foreground">
                  <span className="text-[#A3E635] font-extrabold mr-1">2</span> WhatsApp Number
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#A3E635]/10 border border-[#A3E635]/20 text-[#A3E635]">
                  Required
                </span>
              </div>
              <p className="text-[10px] text-text-muted mb-1.5">Yahi number pe ScanDriver aapse connect karega</p>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface2 border border-border/40 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors placeholder:text-text-muted/50"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            {/* Create Password */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-foreground">
                  Create Account Password
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#A3E635]/10 border border-[#A3E635]/20 text-[#A3E635]">
                  Required
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 text-sm bg-surface2 border border-border/40 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors placeholder:text-text-muted/50"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* 3. Area / Zone */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-foreground">
                  <span className="text-[#A3E635] font-extrabold mr-1">3</span> Area / Zone (Delhi NCR)
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#A3E635]/10 border border-[#A3E635]/20 text-[#A3E635]">
                  Required
                </span>
              </div>
              <p className="text-[10px] text-text-muted mb-1.5">Aap kahan se kaam karna chahte hain?</p>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface2 border border-border/40 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors"
              >
                <option value="" disabled>Zone chunein</option>
                {zones.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-extrabold tracking-wider text-[#A3E635] uppercase whitespace-nowrap">
                EXPERIENCE & DOCUMENTS
              </span>
              <div className="h-[1px] bg-border/20 flex-grow" />
            </div>

            {/* 4. Driving Experience */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  <span className="text-[#A3E635] font-extrabold mr-1">4</span> Driving Experience
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#A3E635]/10 border border-[#A3E635]/20 text-[#A3E635]">
                  Required
                </span>
              </div>
              <div className="space-y-2">
                {experienceOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setExperience(opt.value)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 bg-surface2 border rounded-2xl cursor-pointer transition-all select-none",
                      experience === opt.value
                        ? "border-[#A3E635] bg-[#A3E635]/5 text-[#A3E635]"
                        : "border-border/40 text-foreground/80 hover:bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all",
                      experience === opt.value ? "border-[#A3E635]" : "border-text-muted"
                    )}>
                      {experience === opt.value && (
                        <div className="h-2 w-2 rounded-full bg-[#A3E635]" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold block">{opt.label}</span>
                      {opt.subtext && (
                        <span className="text-[10px] text-text-muted mt-0.5 block">{opt.subtext}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Valid Driving Licence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  <span className="text-[#A3E635] font-extrabold mr-1">5</span> Valid Driving Licence
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#A3E635]/10 border border-[#A3E635]/20 text-[#A3E635]">
                  Required
                </span>
              </div>
              <div className="space-y-2">
                {licenseOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setLicenseStatus(opt.value)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 bg-surface2 border rounded-2xl cursor-pointer transition-all select-none",
                      licenseStatus === opt.value
                        ? "border-[#A3E635] bg-[#A3E635]/5 text-[#A3E635]"
                        : "border-border/40 text-foreground/80 hover:bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all",
                      licenseStatus === opt.value ? "border-[#A3E635]" : "border-text-muted"
                    )}>
                      {licenseStatus === opt.value && (
                        <div className="h-2 w-2 rounded-full bg-[#A3E635]" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold block">{opt.label}</span>
                      {opt.subtext && (
                        <span className="text-[10px] text-text-muted mt-0.5 block">{opt.subtext}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Documents Available */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-foreground">
                  <span className="text-[#A3E635] font-extrabold mr-1">6</span> Documents Available
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#A3E635]/10 border border-[#A3E635]/20 text-[#A3E635]">
                  Required
                </span>
              </div>
              <p className="text-[10px] text-text-muted mb-1.5">Jo bhi hai woh chunein (sab nahi hone chahiye abhi)</p>
              <div className="grid grid-cols-2 gap-2">
                {documentOptions.map((opt) => {
                  const isChecked = documentsAvailable.includes(opt)
                  return (
                    <div
                      key={opt}
                      onClick={() => handleCheckboxToggle(documentsAvailable, setDocumentsAvailable, opt)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-3 bg-surface2 border rounded-2xl cursor-pointer text-xs font-bold transition-all select-none",
                        isChecked ? "border-[#A3E635] bg-[#A3E635]/5 text-[#A3E635]" : "border-border/40 text-foreground/80"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-all",
                        isChecked ? "border-[#A3E635] bg-[#A3E635]" : "border-text-muted"
                      )}>
                        {isChecked && (
                          <svg className="h-3 w-3 text-black fill-current" viewBox="0 0 20 20">
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        )}
                      </div>
                      <span>{opt}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-extrabold tracking-wider text-[#A3E635] uppercase whitespace-nowrap">
                AVAILABILITY & PREFERENCE
              </span>
              <div className="h-[1px] bg-border/20 flex-grow" />
            </div>

            {/* 7. Kab kaam kar sakte hain? */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  <span className="text-[#A3E635] font-extrabold mr-1">7</span> Kab kaam kar sakte hain?
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#A3E635]/10 border border-[#A3E635]/20 text-[#A3E635]">
                  Required
                </span>
              </div>
              <div className="space-y-2">
                {availabilityOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setAvailability(opt.value)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 bg-surface2 border rounded-2xl cursor-pointer transition-all select-none",
                      availability === opt.value
                        ? "border-[#A3E635] bg-[#A3E635]/5 text-[#A3E635]"
                        : "border-border/40 text-foreground/80 hover:bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all",
                      availability === opt.value ? "border-[#A3E635]" : "border-text-muted"
                    )}>
                      {availability === opt.value && (
                        <div className="h-2 w-2 rounded-full bg-[#A3E635]" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold block">{opt.label}</span>
                      {opt.subtext && (
                        <span className="text-[10px] text-text-muted mt-0.5 block">{opt.subtext}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. Kaunsa service prefer karoge? */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  <span className="text-[#A3E635] font-extrabold mr-1">8</span> Kaunsa service prefer karoge?
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900 border border-border/25 text-text-muted">
                  Optional
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {serviceOptions.map((opt) => {
                  const isChecked = servicePreference.includes(opt)
                  return (
                    <div
                      key={opt}
                      onClick={() => handleCheckboxToggle(servicePreference, setServicePreference, opt)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-3 bg-surface2 border rounded-2xl cursor-pointer text-xs font-bold transition-all select-none",
                        isChecked ? "border-[#A3E635] bg-[#A3E635]/5 text-[#A3E635]" : "border-border/40 text-foreground/80"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-all",
                        isChecked ? "border-[#A3E635] bg-[#A3E635]" : "border-text-muted"
                      )}>
                        {isChecked && (
                          <svg className="h-3 w-3 text-black fill-current" viewBox="0 0 20 20">
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        )}
                      </div>
                      <span>{opt}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Vehicle Specialties */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Vehicle Specialties (Select all that apply)
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900 border border-border/25 text-text-muted">
                  Optional
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {vehicleOptions.map((option) => {
                  const isChecked = vehicleSpecialties.includes(option)
                  return (
                    <div 
                      key={option}
                      onClick={() => handleCheckboxToggle(vehicleSpecialties, setVehicleSpecialties, option)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-3 bg-surface2 border rounded-2xl cursor-pointer text-xs font-bold transition-all select-none",
                        isChecked ? "border-[#A3E635] bg-[#A3E635]/5 text-[#A3E635]" : "border-border/40 text-foreground/80"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-all",
                        isChecked ? "border-[#A3E635] bg-[#A3E635]" : "border-text-muted"
                      )}>
                        {isChecked && (
                          <svg className="h-3 w-3 text-black fill-current" viewBox="0 0 20 20">
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-extrabold tracking-wider text-[#A3E635] uppercase whitespace-nowrap">
                ONE LAST THING
              </span>
              <div className="h-[1px] bg-border/20 flex-grow" />
            </div>

            {/* 9. Pehle kisi platform pe kaam kiya? */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-foreground">
                  <span className="text-[#A3E635] font-extrabold mr-1">9</span> Pehle kisi platform pe kaam kiya?
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900 border border-border/25 text-text-muted">
                  Optional
                </span>
              </div>
              <p className="text-[10px] text-text-muted mb-1.5">Koi bhi — DriveU, TATD, Uber, Ola, ya kuch aur</p>
              <input
                type="text"
                value={previousPlatforms}
                onChange={(e) => setPreviousPlatforms(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface2 border border-border/40 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors placeholder:text-text-muted/50"
                placeholder="Platform ka naam ya 'Nahi'"
              />
            </div>

            {/* 10. Kuch aur bolna chahte hain? */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-foreground">
                  <span className="text-[#A3E635] font-extrabold mr-1">10</span> Kuch aur bolna chahte hain?
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900 border border-border/25 text-text-muted">
                  Optional
                </span>
              </div>
              <textarea
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-surface2 border border-border/40 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors placeholder:text-text-muted/50 min-h-[90px] resize-none"
                placeholder="Koi bhi sawaal ya baat..."
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || submitting}
                className="w-full py-3 px-4 bg-[#A3E635] hover:bg-[#A3E635]/90 text-slate-950 font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {(loading || submitting) ? (
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={16} className="fill-slate-950 text-[#A3E635]" />
                    <span>Form Submit Karo</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[10px] text-text-muted leading-relaxed">
                Aapki information sirf ScanDriver team ke paas rahegi.
                <br />
                Koi third party sharing nahi. Form submit hone ke baad 24 ghanto mein WhatsApp pe contact karenge.
              </p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-5 animate-in fade-in-50 zoom-in-95 duration-400 py-6">
            <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <CheckCircle size={32} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground tracking-wide">
                Welcome to ScanDriver!
              </h3>
              <p className="text-sm text-text-muted mt-2 max-w-[300px] leading-relaxed mx-auto">
                Thank you for applying, <span className="text-primary dark:text-[#A3E635] font-bold">{fullName}</span>. 
                Your driver profile has been successfully generated. 
              </p>
            </div>

            <div className="bg-surface2 border border-border/30 p-4 rounded-2xl w-full max-w-[320px] text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#A3E635] border-b border-border/20 pb-1.5 mb-2">
                What happens next?
              </h4>
              <ul className="space-y-1.5 text-[10px] text-text-muted">
                <li className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">1.</span>
                  <span>Document check (Aadhaar & Driving License).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">2.</span>
                  <span>Reference validation & background screening.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">3.</span>
                  <span>Once approved, you will receive an SMS/WhatsApp notice to start accepting bookings.</span>
                </li>
              </ul>
            </div>

            <Link
              href="/driver-app"
              className="inline-flex items-center justify-center w-full max-w-[200px] py-2.5 bg-primary hover:bg-[#A3E635] text-black font-semibold text-sm rounded-xl shadow-md transition-colors"
            >
              RETURN TO LOGIN
            </Link>
          </div>
        )}

        {/* 4. Action Buttons Footer */}
        {step < 4 && (
          <div className="pt-6 border-t border-border/10 flex items-center justify-between gap-4 shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBackStep}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-surface2 hover:bg-muted text-foreground/90 font-semibold text-sm rounded-xl transition-colors cursor-pointer border border-border/30"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <Link
                href="/driver-app"
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-surface2 hover:bg-muted text-text-muted hover:text-foreground font-semibold text-sm rounded-xl transition-colors cursor-pointer border border-border/30"
              >
                Cancel
              </Link>
            )}

            <button
              type="button"
              onClick={handleNextStep}
              className="flex-grow py-2.5 px-4 bg-[#A3E635] hover:bg-[#A3E635]/90 text-slate-950 font-semibold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center cursor-pointer"
            >
              Continue
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
