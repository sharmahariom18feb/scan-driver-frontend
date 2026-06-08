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

  // Steps: 1: Account Info, 2: Driver Details, 3: Professional Info, 4: Success
  const [step, setStep] = useState(1)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [phone, setPhone] = useState('')
  const [licenseNo, setLicenseNo] = useState('')
  const [currentArea, setCurrentArea] = useState('')

  const [experience, setExperience] = useState('5') // default 5 years
  const [vehicleSpecialties, setVehicleSpecialties] = useState<string[]>([])
  const [termsAccepted, setTermsAccepted] = useState(false)

  const vehicleOptions = ['Hatchback', 'Sedan', 'SUV', 'Luxury / Automatic']

  const handleCheckboxChange = (option: string) => {
    if (vehicleSpecialties.includes(option)) {
      setVehicleSpecialties(vehicleSpecialties.filter((item) => item !== option))
    } else {
      setVehicleSpecialties([...vehicleSpecialties, option])
    }
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!firstName || !lastName || !email || !password) {
        toast.error('Please fill in all account fields')
        return
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters long')
        return
      }
      if (!email.includes('@')) {
        toast.error('Please enter a valid email address')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!phone || !licenseNo || !currentArea) {
        toast.error('Please fill in all driving profile details')
        return
      }
      setStep(3)
    }
  }

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted) {
      toast.error('You must accept the terms and conditions to proceed.')
      return
    }

    setSubmitting(true)
    const normalizedPhone = normalizePhone(phone)

    try {
      // Check if email or phone already exists via RPC
      const { data: checkData, error: checkError } = await supabase.rpc(
        'check_user_exists_by_email_or_phone',
        {
          p_email: email.trim().toLowerCase(),
          p_phone: normalizedPhone
        }
      )

      if (checkError) {
        throw new Error(checkError.message || 'Duplication check failed')
      }

      const checkResult = Array.isArray(checkData) ? checkData[0] : checkData
      if (checkResult) {
        if (checkResult.email_exists) {
          toast.error('An account with this email address already exists.')
          setSubmitting(false)
          return
        }
        if (checkResult.phone_exists) {
          toast.error('An account with this phone number already exists.')
          setSubmitting(false)
          return
        }
      }

      const result = await dispatch(
        signupDriver({
          firstName,
          lastName,
          phone: normalizedPhone,
          email: email.trim().toLowerCase(),
          currentArea,
          licenseNo,
          password,
        })
      )

      if (signupDriver.fulfilled.match(result)) {
        setStep(4)
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
  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : step === 3 ? 90 : 100

  return (
    <div className="flex-grow flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
      <Toaster position="top-center" richColors />

      {/* 1. Header Banner */}
      <header className="relative bg-gradient-to-br from-slate-900/90 to-slate-950 px-6 py-6 border-b border-border/10 overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-32 mb-3 flex items-center justify-center">
            <Image src={logoSd} alt="ScanDriver Logo" width={140} className="object-contain" priority />
          </div>
          
          {step < 4 ? (
            <>
              <h2 className="text-xl font-bold tracking-tight text-white font-display">
                Become a Driver Partner
              </h2>
              <p className="text-xs text-text-muted mt-1 max-w-[320px]">
                Delhi NCR's trusted driver platform. Sign up to start receiving ride requests near you.
              </p>
              
              <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-gold-light text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mt-3">
                <Shield size={10} /> 100% Verified Profiles
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold tracking-tight text-emerald-400 font-display">
                Registration Successful!
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Your application has been received.
              </p>
            </>
          )}
        </div>
      </header>

      {/* 2. Progress Indicator Bar */}
      {step < 4 && (
        <div className="w-full h-[3px] bg-slate-900 relative shrink-0">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* 3. Steps Body */}
      <main className="flex-grow px-6 py-6 flex flex-col justify-between">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 text-gold-light uppercase tracking-wider text-[10px] font-bold mb-2">
              <User size={12} /> Step 1: Personal Account Info
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                  First Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-border/20 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors placeholder:text-slate-650"
                  placeholder="e.g. Ramesh"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                  Last Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-border/20 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors placeholder:text-slate-650"
                  placeholder="e.g. Kumar"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Email Address <span className="text-primary">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-border/20 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors placeholder:text-slate-650"
                placeholder="e.g. ramesh@gmail.com"
              />
              <p className="text-[9px] text-slate-500 mt-1">Used to recover account password and login.</p>
            </div>

            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Create Account Password <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 text-xs bg-slate-900 border border-border/20 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors placeholder:text-slate-650"
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
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 text-gold-light uppercase tracking-wider text-[10px] font-bold mb-2">
              <FileText size={12} /> Step 2: Driving Details
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Mobile Number (Indian format) <span className="text-primary">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-border/20 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors placeholder:text-slate-650"
                placeholder="e.g. 9876543210"
              />
              <p className="text-[9px] text-slate-500 mt-1">We will send booking details via SMS/Whatsapp to this number.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Driving License Number <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-border/20 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors placeholder:text-slate-650 uppercase font-mono tracking-wider"
                placeholder="e.g. DL-13XXXXXXXXXXX"
              />
              <p className="text-[9px] text-slate-500 mt-1">Requires manual validation from administration.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Current Operating Area <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={currentArea}
                onChange={(e) => setCurrentArea(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-border/20 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors placeholder:text-slate-650"
                placeholder="e.g. Dwarka, New Delhi"
              />
              <p className="text-[9px] text-slate-500 mt-1">Your location area where you want to accept bookings.</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 text-gold-light uppercase tracking-wider text-[10px] font-bold mb-2">
              <Briefcase size={12} /> Step 3: Professional Background
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Driving Experience (Years)
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-border/20 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors"
              >
                <option value="1-2">1 to 2 Years</option>
                <option value="3-4">3 to 4 Years</option>
                <option value="5">5+ Years (Recommended)</option>
                <option value="10">10+ Years</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
                Vehicle Specialties (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {vehicleOptions.map((option) => (
                  <label 
                    key={option}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 bg-slate-900 border rounded-xl cursor-pointer text-xs transition-all select-none",
                      vehicleSpecialties.includes(option) ? "border-primary/55 bg-primary/5 text-gold-light" : "border-border/20 text-slate-300"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={vehicleSpecialties.includes(option)}
                      onChange={() => handleCheckboxChange(option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-primary focus:ring-0 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 leading-normal">
                  I certify that all details above are correct. I agree to ScanDriver’s 
                  <span className="text-gold-light underline mx-1">Privacy Policy</span> and 
                  <span className="text-gold-light underline mx-1">Driver Partner Agreement</span>.
                </span>
              </label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-5 animate-in fade-in-50 zoom-in-95 duration-400 py-6">
            <div className="h-16 w-16 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <CheckCircle size={32} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Welcome to ScanDriver!
              </h3>
              <p className="text-xs text-text-muted mt-2 max-w-[300px] leading-relaxed mx-auto">
                Thank you for applying, <span className="text-gold-light font-bold">{firstName}</span>. 
                Your driver profile has been successfully generated. 
              </p>
            </div>

            <div className="bg-slate-900/60 border border-border/10 p-4 rounded-2xl w-full max-w-[320px] text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold-light border-b border-border/10 pb-1.5 mb-2">
                What happens next?
              </h4>
              <ul className="space-y-1.5 text-[10px] text-slate-300">
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
              className="inline-flex items-center justify-center w-full max-w-[200px] py-2.5 bg-primary hover:bg-gold-light text-black font-semibold text-xs rounded-xl shadow-md transition-colors"
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
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer border border-border/10"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <Link
                href="/driver-app"
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-350 font-semibold text-xs rounded-xl transition-colors cursor-pointer border border-border/10"
              >
                Cancel
              </Link>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-grow py-2.5 px-4 bg-primary hover:bg-gold-light text-black font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center cursor-pointer"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || submitting}
                className="flex-grow py-2.5 px-4 bg-primary hover:bg-gold-light text-black font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {(loading || submitting) ? (
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  'SUBMIT APPLICATION'
                )}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
