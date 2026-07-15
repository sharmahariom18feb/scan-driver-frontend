'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Shield, CheckCircle, Eye, EyeOff, Upload, X } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { AppDispatch, RootState } from '@/redux/store'
import { signupDriver, normalizePhone } from '@/redux/slices/driverSlice'
import { cn } from '@/lib/utils'
import logoSd from '../../../../public/icons/logo-sd.png'
import qrCodeImg from '../../../../public/QRCODE.jpeg'
import { supabase } from '@/lib/supabaseClient'
import { uploadToCloudinary } from '@/lib/cloudinary'

export default function OnboardingPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { loading } = useSelector((state: RootState) => state.driver)

  // Steps: 
  // 1: Basic Info
  // 2: Experience & Preferences (Merged Experience & Preference)
  // 3: Required Document Uploads (Aadhaar Front/Back, DL, PAN, Selfie)
  // 4: References & One Last Thing (3 References + Platforms & Comments)
  // 5: Success
  const [step, setStep] = useState(1)

  // Step 1: Basic Info
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [zone, setZone] = useState('')
  const [referredBy, setReferredBy] = useState('')

  // Step 2: Experience & Preferences
  const [experience, setExperience] = useState('1-3 saal')
  const [licenseStatus, setLicenseStatus] = useState('Haan, valid hai')
  const [availability, setAvailability] = useState('Full Time')
  const [servicePreference, setServicePreference] = useState<string[]>([])
  const [vehicleSpecialties, setVehicleSpecialties] = useState<string[]>([])

  // Step 3: Required Document Uploads
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState('')
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState('')
  const [drivingLicenseUrl, setDrivingLicenseUrl] = useState('')
  const [panCardUrl, setPanCardUrl] = useState('')
  const [selfieUrl, setSelfieUrl] = useState('')
  const [paymentUrl, setPaymentUrl] = useState('')

  // Selected File objects for deferred upload
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState<File | null>(null)
  const [aadhaarBackFile, setAadhaarBackFile] = useState<File | null>(null)
  const [drivingLicenseFile, setDrivingLicenseFile] = useState<File | null>(null)
  const [panCardFile, setPanCardFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [paymentFile, setPaymentFile] = useState<File | null>(null)

  const [uploadingStates, setUploadingStates] = useState({
    aadhaarFront: false,
    aadhaarBack: false,
    drivingLicense: false,
    panCard: false,
    selfie: false,
    payment: false
  })

  const [uploadProgress, setUploadProgress] = useState({
    aadhaarFront: 0,
    aadhaarBack: 0,
    drivingLicense: 0,
    panCard: 0,
    selfie: 0,
    payment: 0
  })

  // Step 4: References & One Last Thing
  const [references, setReferences] = useState([
    { fullName: '', phone: '', relation: '' },
    { fullName: '', phone: '', relation: '' },
    { fullName: '', phone: '', relation: '' }
  ])
  const [previousPlatforms, setPreviousPlatforms] = useState('')
  const [additionalComments, setAdditionalComments] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [viewingQr, setViewingQr] = useState(false)
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null)
  const [viewingImageLabel, setViewingImageLabel] = useState<string>('')

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

  const vehicleOptions = ['Manual', 'Automatic']

  const handleCheckboxToggle = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, option: string) => {
    if (list.includes(option)) {
      setList(list.filter((item) => item !== option))
    } else {
      setList([...list, option])
    }
  }

  const handleReferenceChange = (index: number, key: string, value: string) => {
    const updated = [...references]
    let finalValue = value
    if (key === 'phone') {
      finalValue = value.replace(/\D/g, '').slice(0, 10)
    }
    updated[index] = { ...updated[index], [key]: finalValue }
    setReferences(updated)
  }

  const handleFileSelect = (key: 'aadhaarFront' | 'aadhaarBack' | 'drivingLicense' | 'panCard' | 'selfie' | 'payment', file: File) => {
    if (!file) return

    let oldUrl = ''
    if (key === 'aadhaarFront') {
      oldUrl = aadhaarFrontUrl
      setAadhaarFrontFile(file)
      const previewUrl = URL.createObjectURL(file)
      setAadhaarFrontUrl(previewUrl)
    } else if (key === 'aadhaarBack') {
      oldUrl = aadhaarBackUrl
      setAadhaarBackFile(file)
      const previewUrl = URL.createObjectURL(file)
      setAadhaarBackUrl(previewUrl)
    } else if (key === 'drivingLicense') {
      oldUrl = drivingLicenseUrl
      setDrivingLicenseFile(file)
      const previewUrl = URL.createObjectURL(file)
      setDrivingLicenseUrl(previewUrl)
    } else if (key === 'panCard') {
      oldUrl = panCardUrl
      setPanCardFile(file)
      const previewUrl = URL.createObjectURL(file)
      setPanCardUrl(previewUrl)
    } else if (key === 'selfie') {
      oldUrl = selfieUrl
      setSelfieFile(file)
      const previewUrl = URL.createObjectURL(file)
      setSelfieUrl(previewUrl)
    } else if (key === 'payment') {
      oldUrl = paymentUrl
      setPaymentFile(file)
      const previewUrl = URL.createObjectURL(file)
      setPaymentUrl(previewUrl)
    }

    if (oldUrl && oldUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(oldUrl)
      } catch (e) {
        console.error('Failed to revoke object URL:', e)
      }
    }

    toast.success('Document selected successfully!')
  }

  const handleCancel = () => {
    // Revoke all local object URLs
    [aadhaarFrontUrl, aadhaarBackUrl, drivingLicenseUrl, panCardUrl, selfieUrl, paymentUrl].forEach((url) => {
      if (url && url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(url)
        } catch (e) {
          console.error('Failed to revoke object URL:', e)
        }
      }
    })

    // Reset all files and URLs
    setAadhaarFrontFile(null)
    setAadhaarBackFile(null)
    setDrivingLicenseFile(null)
    setPanCardFile(null)
    setSelfieFile(null)
    setPaymentFile(null)

    setAadhaarFrontUrl('')
    setAadhaarBackUrl('')
    setDrivingLicenseUrl('')
    setPanCardUrl('')
    setSelfieUrl('')
    setPaymentUrl('')

    toast.info('Registration cancelled.')
    router.push('/driver-app')
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
      if (!availability) {
        toast.error('Please select when you can work')
        return
      }
      setStep(3)
    } else if (step === 3) {
      if (!aadhaarFrontFile) {
        toast.error('Please select Aadhaar Card Front photo')
        return
      }
      if (!aadhaarBackFile) {
        toast.error('Please select Aadhaar Card Back photo')
        return
      }
      if (!drivingLicenseFile) {
        toast.error('Please select Driving Licence photo')
        return
      }
      if (!panCardFile) {
        toast.error('Please select PAN Card photo')
        return
      }
      if (!selfieFile) {
        toast.error('Please select your Selfie photo')
        return
      }
      setStep(4)
    } else if (step === 4) {
      // Validate references
      for (let i = 0; i < 3; i++) {
        const ref = references[i]
        if (!ref.fullName.trim()) {
          toast.error(`Please enter Full Name for Reference ${i + 1}`)
          return
        }
        if (!ref.phone.trim()) {
          toast.error(`Please enter Phone Number for Reference ${i + 1}`)
          return
        }
        const refPhoneDigits = ref.phone.replace(/\D/g, '')
        if (refPhoneDigits.length !== 10) {
          toast.error(`Please enter a valid 10-digit Phone Number for Reference ${i + 1}`)
          return
        }
        if (!ref.relation) {
          toast.error(`Please select Relation for Reference ${i + 1}`)
          return
        }
      }
      // setStep(5)
      handleSubmit()
    } /* else if (step === 5) {
      if (!paymentFile) {
        toast.error('Please select your ₹300 payment screenshot')
        return
      }
      handleSubmit()
    } */
  }

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    // Validate references
    for (let i = 0; i < 3; i++) {
      const ref = references[i]
      if (!ref.fullName.trim()) {
        toast.error(`Please enter Full Name for Reference ${i + 1}`)
        return
      }
      if (!ref.phone.trim()) {
        toast.error(`Please enter Phone Number for Reference ${i + 1}`)
        return
      }
      const refPhoneDigits = ref.phone.replace(/\D/g, '')
      if (refPhoneDigits.length !== 10) {
        toast.error(`Please enter a valid 10-digit Phone Number for Reference ${i + 1}`)
        return
      }
      if (!ref.relation) {
        toast.error(`Please select Relation for Reference ${i + 1}`)
        return
      }
    }

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

      // Step 1.5: Upload files to Cloudinary in parallel now that check passes
      toast.loading('Uploading documents to Cloudinary...', { id: 'submit-toast' })

      const uploadPromises = [
        aadhaarFrontFile ? uploadToCloudinary(aadhaarFrontFile) : Promise.resolve(''),
        aadhaarBackFile ? uploadToCloudinary(aadhaarBackFile) : Promise.resolve(''),
        drivingLicenseFile ? uploadToCloudinary(drivingLicenseFile) : Promise.resolve(''),
        panCardFile ? uploadToCloudinary(panCardFile) : Promise.resolve(''),
        selfieFile ? uploadToCloudinary(selfieFile) : Promise.resolve(''),
        paymentFile ? uploadToCloudinary(paymentFile) : Promise.resolve(''),
      ]

      let aadhaarFrontCloudUrl = ''
      let aadhaarBackCloudUrl = ''
      let drivingLicenseCloudUrl = ''
      let panCardCloudUrl = ''
      let selfieCloudUrl = ''
      let paymentCloudUrl = ''

      try {
        const [
          afUrl,
          abUrl,
          dlUrl,
          pcUrl,
          sfUrl,
          pyUrl
        ] = await Promise.all(uploadPromises)

        aadhaarFrontCloudUrl = afUrl
        aadhaarBackCloudUrl = abUrl
        drivingLicenseCloudUrl = dlUrl
        panCardCloudUrl = pcUrl
        selfieCloudUrl = sfUrl
        paymentCloudUrl = pyUrl
      } catch (uploadErr: any) {
        console.error('Document upload failed:', uploadErr)
        toast.error(uploadErr.message || 'Document upload failed. Please try again.', { id: 'submit-toast' })
        setSubmitting(false)
        return
      }

      // Step 2: Sign up user
      toast.loading('Registering profile...', { id: 'submit-toast' })
      const result = await dispatch(
        signupDriver({
          fullName,
          phone: normalizedPhone,
          currentArea: zone,
          licenseNo: 'PENDING_VERIFICATION',
          password,
          referredBy: referredBy || undefined,
        })
      )

      if (signupDriver.fulfilled.match(result)) {
        const user = result.payload
        if (!user || !user.id) {
          throw new Error('Authentication signup succeeded but returned no profile details')
        }

        // Step 3: Write additional attributes into driver_profiles table
        const { error: profileError } = await supabase
          .from('driver_profiles')
          .insert({
            id: user.id,
            experience,
            license_status: licenseStatus,
            documents_available: ['Aadhaar Card', 'Driving Licence', 'PAN Card', 'Selfie', 'Registration Payment'],
            availability,
            service_preference: servicePreference,
            vehicle_specialties: vehicleSpecialties,
            previous_platforms: previousPlatforms || null,
            additional_comments: additionalComments || null
          })

        if (profileError) {
          throw new Error(profileError.message || 'Failed to register additional profile details')
        }

        // Step 4: Write documents and references into driver_documents table
        const { error: docsError } = await supabase
          .from('driver_documents')
          .insert({
            driver_id: user.id,
            aadhaar_front_url: aadhaarFrontCloudUrl,
            aadhaar_back_url: aadhaarBackCloudUrl,
            driving_license_url: drivingLicenseCloudUrl,
            pan_card_url: panCardCloudUrl,
            selfie_url: selfieCloudUrl,
            references: references,
            payment: paymentCloudUrl
          })

        if (docsError) {
          throw new Error(docsError.message || 'Failed to save documents and references')
        }

        // Clean up object URLs to release memory
        [aadhaarFrontUrl, aadhaarBackUrl, drivingLicenseUrl, panCardUrl, selfieUrl, paymentUrl].forEach((url) => {
          if (url && url.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(url)
            } catch (e) { }
          }
        })

        setStep(6) // success step is now step 6
        toast.success('Registration completed successfully!', { id: 'submit-toast' })
      } else {
        const errMsg = result.payload as string || 'Registration failed'
        toast.error(errMsg, { id: 'submit-toast' })
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      toast.error(err.message || 'An error occurred during registration', { id: 'submit-toast' })
    } finally {
      setSubmitting(false)
    }
  }

  const renderUploadCard = (
    label: string,
    key: 'aadhaarFront' | 'aadhaarBack' | 'drivingLicense' | 'panCard' | 'selfie' | 'payment',
    urlValue: string,
    subtext: string
  ) => {
    const isUploading = uploadingStates[key]
    const progress = uploadProgress[key]

    return (
      <div className="relative bg-surface2 border border-border/40 hover:border-[#E8B84B]/50 transition-all duration-200 p-4 rounded-2xl flex flex-col justify-between items-stretch min-h-[145px]">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-foreground block mb-0.5">{label}</span>
            <span className="text-[10px] text-text-muted block leading-tight">{subtext}</span>
          </div>
          {urlValue && (
            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Selected
            </span>
          )}
        </div>

        <div className="mt-3 relative flex items-center justify-center flex-grow">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-3 space-y-1.5 w-full">
              <div className="h-5 w-5 border-2 border-[#E8B84B] border-t-transparent rounded-full animate-spin" />
              <span className="text-[9px] text-[#E8B84B] font-extrabold">{progress}% uploading</span>
            </div>
          ) : urlValue ? (
            <div className="relative w-full h-24 rounded-xl overflow-hidden border border-border/30 group">
              <img
                src={urlValue}
                alt={label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewingImageUrl(urlValue)
                    setViewingImageLabel(label)
                  }}
                  className="cursor-pointer text-white font-extrabold text-[9px] uppercase tracking-wider bg-[#E8B84B] text-slate-950 px-2 py-1.5 rounded-lg border border-[#E8B84B]/30 hover:bg-[#E8B84B]/90 transition-all"
                >
                  View
                </button>
                <label className="cursor-pointer text-white font-extrabold text-[9px] uppercase tracking-wider bg-slate-950/80 px-2 py-1.5 rounded-lg border border-white/10 hover:border-white/30 hover:bg-slate-900 transition-all">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect(key, file)
                    }}
                  />
                </label>
              </div>
            </div>
          ) : (
            <label className="w-full flex flex-col items-center justify-center py-5 border border-dashed border-border/40 rounded-xl cursor-pointer hover:bg-muted/10 transition-colors">
              <Upload className="h-5 w-5 text-text-muted mb-1" />
              <span className="text-[9px] font-extrabold text-[#E8B84B] uppercase tracking-wider">Upload File</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(key, file)
                }}
              />
            </label>
          )}
        </div>
      </div>
    )
  }

  // Calculate Progress Percentage (Temporarily removed payment step)
  const progressPercent = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : step === 4 ? 95 : 100

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

          {step < 6 ? (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">
                Become a Driver Partner
              </h2>
              <p className="text-sm text-text-muted mt-1 max-w-[320px]">
                Delhi NCR's trusted driver platform. Sign up to start receiving ride requests near you.
              </p>

              <div className="inline-flex items-center gap-1.5 bg-[#E8B84B]/10 border border-[#E8B84B]/25 text-[#E8B84B] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mt-3">
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
      {step < 6 && (
        <div className="w-full h-[3px] bg-surface2 relative shrink-0">
          <div
            className="h-full bg-[#E8B84B] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* 3. Steps Body */}
      <main className="flex-grow px-6 py-6 flex flex-col justify-between">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-extrabold tracking-wider text-[#E8B84B] uppercase whitespace-nowrap">
                BASIC INFORMATION
              </span>
              <div className="h-[1px] bg-border/20 flex-grow" />
            </div>

            {/* 1. Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-foreground">
                  <span className="text-black font-bold mr-1">1</span> Full Name
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E8B84B]/10 border border-[#E8B84B]/20 text-[#E8B84B]">
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
                  <span className="text-black font-bold mr-1">2</span> WhatsApp Number
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E8B84B]/10 border border-[#E8B84B]/20 text-[#E8B84B]">
                  Required
                </span>
              </div>
              <p className="text-[10px] text-text-muted mb-1.5">Yahi number pe ScanDriver aapse connect karega</p>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full px-3 py-2 text-sm bg-surface2 border border-border/40 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors placeholder:text-text-muted/50"
                placeholder="10-digit mobile number"
              />
            </div>

            {/* Create Password */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-foreground">
                  Create Account Password
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E8B84B]/10 border border-[#E8B84B]/20 text-[#E8B84B]">
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
                  <span className="text-black font-bold mr-1">3</span> Area / Zone (Delhi NCR)
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E8B84B]/10 border border-[#E8B84B]/20 text-[#E8B84B]">
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

            {/* Referral Code */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-foreground">
                  Referral Code (Optional)
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-surface2 border border-border/10 text-text-muted">
                  Optional
                </span>
              </div>
              <input
                type="text"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value.trim())}
                className="w-full px-3 py-2 text-sm bg-surface2 border border-border/40 rounded-xl focus:border-primary focus:outline-none text-foreground transition-colors placeholder:text-text-muted/50 font-medium"
                placeholder="Enter referral code if any (e.g. 123456)"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-extrabold tracking-wider text-[#E8B84B] uppercase whitespace-nowrap">
                EXPERIENCE & PREFERENCES
              </span>
              <div className="h-[1px] bg-border/20 flex-grow" />
            </div>

            {/* Driving Experience */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Driving Experience
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E8B84B]/10 border border-[#E8B84B]/20 text-[#E8B84B]">
                  Required
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {experienceOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setExperience(opt.value)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 bg-surface2 border rounded-2xl cursor-pointer transition-all text-center select-none",
                      experience === opt.value
                        ? "border-[#E8B84B] bg-[#E8B84B]/5 text-[#E8B84B]"
                        : "border-border/40 text-foreground/80 hover:bg-muted/30"
                    )}
                  >
                    <span className="text-xs font-bold block">{opt.label}</span>
                    {opt.subtext && (
                      <span className="text-[8px] text-text-muted mt-0.5 block">{opt.subtext}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Valid Driving Licence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Valid Driving Licence
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E8B84B]/10 border border-[#E8B84B]/20 text-[#E8B84B]">
                  Required
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {licenseOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setLicenseStatus(opt.value)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 bg-surface2 border rounded-2xl cursor-pointer transition-all text-center select-none",
                      licenseStatus === opt.value
                        ? "border-[#E8B84B] bg-[#E8B84B]/5 text-[#E8B84B]"
                        : "border-border/40 text-foreground/80 hover:bg-muted/30"
                    )}
                  >
                    <span className="text-xs font-bold block">{opt.label}</span>
                    {opt.subtext && (
                      <span className="text-[9px] text-text-muted mt-0.5 block">{opt.subtext}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Kab kaam kar sakte hain? */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Kab kaam kar sakte hain?
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E8B84B]/10 border border-[#E8B84B]/20 text-[#E8B84B]">
                  Required
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {availabilityOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setAvailability(opt.value)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 bg-surface2 border rounded-2xl cursor-pointer transition-all text-center select-none",
                      availability === opt.value
                        ? "border-[#E8B84B] bg-[#E8B84B]/5 text-[#E8B84B]"
                        : "border-border/40 text-foreground/80 hover:bg-muted/30"
                    )}
                  >
                    <span className="text-xs font-bold block">{opt.label}</span>
                    {opt.subtext && (
                      <span className="text-[8px] text-text-muted mt-0.5 block">{opt.subtext}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Kaunsa service prefer karoge? */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Kaunsa service prefer karoge?
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-surface2 border border-border/10 text-text-muted">
                  Optional
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {serviceOptions.map((opt) => {
                  const isChecked = servicePreference.includes(opt)
                  return (
                    <div
                      key={opt}
                      onClick={() => handleCheckboxToggle(servicePreference, setServicePreference, opt)}
                      className={cn(
                        "flex items-center justify-center py-2 bg-surface2 border rounded-2xl cursor-pointer text-[10px] font-bold text-center transition-all select-none",
                        isChecked ? "border-[#E8B84B] bg-[#E8B84B]/5 text-[#E8B84B]" : "border-border/40 text-foreground/80"
                      )}
                    >
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
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-surface2 border border-border/10 text-text-muted">
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
                        "flex items-center gap-2 px-3 py-2.5 bg-surface2 border rounded-2xl cursor-pointer text-xs font-bold transition-all select-none",
                        isChecked ? "border-[#E8B84B] bg-[#E8B84B]/5 text-[#E8B84B]" : "border-border/40 text-foreground/80"
                      )}
                    >
                      <div className={cn(
                        "h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-all",
                        isChecked ? "border-[#E8B84B] bg-[#E8B84B]" : "border-text-muted"
                      )}>
                        {isChecked && (
                          <svg className="h-2.5 w-2.5 text-black fill-current" viewBox="0 0 20 20">
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

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-extrabold tracking-wider text-[#E8B84B] uppercase whitespace-nowrap">
                REQUIRED DOCUMENT UPLOADS
              </span>
              <div className="h-[1px] bg-border/20 flex-grow" />
            </div>

            <p className="text-[10px] text-text-muted">
              Sabhi documents required hain. Please original scan ya saaf photo upload karein.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderUploadCard('Aadhaar Card - Front Side', 'aadhaarFront', aadhaarFrontUrl, 'Front side clear photo')}
              {renderUploadCard('Aadhaar Card - Back Side', 'aadhaarBack', aadhaarBackUrl, 'Back side clear photo with address')}
              {renderUploadCard('Driving Licence', 'drivingLicense', drivingLicenseUrl, 'Valid DL clear photo')}
              {renderUploadCard('PAN Card', 'panCard', panCardUrl, 'PAN card clear photo')}
              {renderUploadCard('Your Selfie', 'selfie', selfieUrl, 'Clear face selfie without glasses / cap')}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-extrabold tracking-wider text-[#E8B84B] uppercase whitespace-nowrap">
                REFERENCES & FINAL DETAILS
              </span>
              <div className="h-[1px] bg-border/20 flex-grow" />
            </div>

            {/* References Forms */}
            <div className="space-y-4">
              <div>
                <span className="text-[10.5px] font-bold text-foreground">
                  REFERENCES (3 required)
                </span>
                <p className="text-[9.5px] text-text-muted mt-0.5">
                  We may contact these references for background verification.
                </p>
              </div>

              {[0, 1, 2].map((idx) => (
                <div key={idx} className="bg-surface2 border border-border/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-4.5 w-4.5 rounded-full bg-[#E8B84B] text-slate-950 font-extrabold text-[9px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-extrabold tracking-wider text-[#E8B84B] uppercase">
                      REFERENCE {idx + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Full Name */}
                    <div>
                      <label className="text-[9px] font-extrabold text-foreground block mb-1">
                        FULL NAME <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={references[idx].fullName}
                        onChange={(e) => handleReferenceChange(idx, 'fullName', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-xl focus:border-primary focus:outline-none text-foreground placeholder:text-text-muted/40"
                        placeholder="Reference full name"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="text-[9px] font-extrabold text-foreground block mb-1">
                        PHONE NUMBER <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={references[idx].phone}
                        onChange={(e) => handleReferenceChange(idx, 'phone', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-xl focus:border-primary focus:outline-none text-foreground placeholder:text-text-muted/40"
                        placeholder="10-digit mobile number"
                      />
                    </div>

                    {/* Relation */}
                    <div>
                      <label className="text-[9px] font-extrabold text-foreground block mb-1">
                        YOUR RELATION <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={references[idx].relation}
                        onChange={(e) => handleReferenceChange(idx, 'relation', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-xl focus:border-primary focus:outline-none text-foreground"
                      >
                        <option value="" disabled>-- Select Relation --</option>
                        <option value="Parent">Parent (Mata / Pita)</option>
                        <option value="Sibling">Sibling (Bhai / Behan)</option>
                        <option value="Spouse">Spouse (Pati / Patni)</option>
                        <option value="Relative">Relative (Rishtedar)</option>
                        <option value="Friend">Friend (Dost)</option>
                        <option value="Employer">Employer (Pehle ke malik)</option>
                        <option value="Other">Other (Koi aur)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 9. Pehle kisi platform pe kaam kiya? */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-foreground">
                  Pehle kisi platform pe kaam kiya?
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-surface2 border border-border/10 text-text-muted">
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
                  Kuch aur bolna chahte hain?
                </label>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-surface2 border border-border/10 text-text-muted">
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
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-extrabold tracking-wider text-[#E8B84B] uppercase whitespace-nowrap">
                REGISTRATION FEE PAYMENT
              </span>
              <div className="h-[1px] bg-border/20 flex-grow" />
            </div>

            <div className="bg-surface2 border border-border/30 rounded-2xl p-4 text-center space-y-4">
              <p className="text-xs text-text-muted leading-relaxed">
                Scan Driver partner registration verification ke liye aapko onboarding fees **₹300** pay karni hogi.
              </p>

              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl border border-border/10 max-w-[200px] mx-auto font-sans">
                <Image
                  src={qrCodeImg}
                  alt="Registration QR Code"
                  onClick={() => setViewingQr(true)}
                  className="w-full h-auto object-contain rounded-lg shadow-sm cursor-zoom-in hover:opacity-90 transition-opacity"
                  title="Click to zoom in"
                  priority
                />
                <span className="text-xs font-bold text-slate-900 mt-2">Scan & Pay ₹ 300</span>
              </div>

              <p className="text-[10px] text-text-muted">
                Payment complete karne ke baad, screenshot niche upload karein verification ke liye.
              </p>
            </div>

            {/* Upload payment screenshot card */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">
                Payment Screenshot
              </label>
              {renderUploadCard('Payment Screenshot', 'payment', paymentUrl, 'Upload screenshot of your transaction')}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-5 animate-in fade-in-50 zoom-in-95 duration-400 py-6">
            <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <CheckCircle size={32} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground tracking-wide">
                Welcome to ScanDriver!
              </h3>
              <p className="text-sm text-text-muted mt-2 max-w-[300px] leading-relaxed mx-auto">
                Thank you for applying, <span className="text-primary dark:text-[#E8B84B] font-bold">{fullName}</span>.
                Your driver profile and documents have been successfully uploaded.
              </p>
            </div>

            <div className="bg-surface2 border border-border/30 p-4 rounded-2xl w-full max-w-[320px] text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#E8B84B] border-b border-border/20 pb-1.5 mb-2">
                What happens next?
              </h4>
              <ul className="space-y-1.5 text-[10px] text-text-muted">
                <li className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">1.</span>
                  <span>Document check (Aadhaar, PAN & Driving License).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">2.</span>
                  <span>Payment verification & reference validation.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">3.</span>
                  <span>Once approved, you will receive an SMS/WhatsApp notice to start accepting bookings.</span>
                </li>
              </ul>
            </div>

            <Link
              href="/driver-app"
              className="inline-flex items-center justify-center w-full max-w-[200px] py-2.5 bg-primary hover:bg-[#E8B84B] text-black font-semibold text-sm rounded-xl shadow-md transition-colors"
            >
              RETURN TO LOGIN
            </Link>
          </div>
        )}

        {/* 4. Action Buttons Footer */}
        {step < 6 && (
          <div className="pt-6 border-t border-border/10 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBackStep}
                  disabled={loading || submitting}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-surface2 hover:bg-muted text-foreground/90 font-semibold text-sm rounded-xl transition-colors cursor-pointer border border-border/30 disabled:opacity-50"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading || submitting}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-surface2 hover:bg-muted text-text-muted hover:text-foreground font-semibold text-sm rounded-xl transition-colors cursor-pointer border border-border/30 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={loading || submitting}
              className="flex-grow py-2.5 px-4 bg-[#E8B84B] hover:bg-[#E8B84B]/90 text-slate-950 font-semibold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {submitting || loading ? (
                <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : step === 4 ? (
                'Submit Registration'
              ) : (
                'Continue'
              )}
            </button>
          </div>
        )}
        {/* Modal: View QR Code */}
        {viewingQr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
            <div className="bg-slate-900 border border-slate-850 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border/10 flex justify-between items-center bg-surface">
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-[#E8B84B]">Registration Payment QR</h3>
                <button
                  onClick={() => setViewingQr(false)}
                  className="text-text-muted hover:text-foreground p-1 rounded-full cursor-pointer hover:bg-surface2 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              {/* Body */}
              <div className="p-6 flex flex-col items-center justify-center bg-white overflow-y-auto max-h-[70vh]">
                <Image
                  src={qrCodeImg}
                  alt="Registration QR Code"
                  className="max-w-full h-auto object-contain rounded-lg"
                />
              </div>
              {/* Footer */}
              <div className="px-4 py-3 border-t border-border/10 flex justify-end bg-surface">
                <button
                  onClick={() => setViewingQr(false)}
                  className="px-4 py-2 rounded-lg bg-[#E8B84B] hover:bg-[#E8B84B]/90 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: View Uploaded Document */}
        {viewingImageUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
            <div className="bg-slate-900 border border-slate-850 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border/10 flex justify-between items-center bg-surface">
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-[#E8B84B]">{viewingImageLabel} Preview</h3>
                <button
                  onClick={() => {
                    setViewingImageUrl(null)
                    setViewingImageLabel('')
                  }}
                  className="text-text-muted hover:text-foreground p-1 rounded-full cursor-pointer hover:bg-surface2 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              {/* Body */}
              <div className="p-4 flex flex-col items-center justify-center bg-slate-950 overflow-y-auto max-h-[70vh] w-full">
                <img
                  src={viewingImageUrl}
                  alt={viewingImageLabel}
                  className="max-w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-md"
                />
              </div>
              {/* Footer */}
              <div className="px-4 py-3 border-t border-border/10 flex justify-end bg-surface">
                <button
                  onClick={() => {
                    setViewingImageUrl(null)
                    setViewingImageLabel('')
                  }}
                  className="px-4 py-2 rounded-lg bg-[#E8B84B] hover:bg-[#E8B84B]/90 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
