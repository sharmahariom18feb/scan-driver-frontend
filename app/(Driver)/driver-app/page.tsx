'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import logoSd from '../../../public/icons/logo-sd.png'
import {
  Home as HomeIcon,
  Briefcase,
  Bell,
  User as UserIcon,
  Moon,
  Sun,
  ArrowLeft,
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { AppDispatch, RootState } from '@/redux/store'
import {
  loginDriver,
  signupDriver,
  checkDriverSession,
  updateDriverProfile,
  toggleOnlineStatus,
  acceptBooking,
  passBooking,
  logoutDriver,
  markAllNotificationsAsRead,
  fetchBookings,
  fetchNotifications,
  sendDriverOtp,
  verifyDriverOtp,
  normalizePhone,
  Booking,
  fetchDriverProfile,
  updateTripStatus,
} from '@/redux/slices/driverSlice'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'

// Subcomponents
import AuthScreen from '@/components/driver/AuthScreen'
import HomeTab from '@/components/driver/HomeTab'
import BookingsTab from '@/components/driver/BookingsTab'
import AlertsTab from '@/components/driver/AlertsTab'
import ProfileTab from '@/components/driver/ProfileTab'
import BookingDetailModal from '@/components/driver/BookingDetailModal'

export default function DriverApp() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { isAuthenticated, isOnline, info, bookings, notifications, stats, loading, error, checkingSession } = useSelector(
    (state: RootState) => state.driver
  )
  const { theme, setTheme } = useTheme()
  const [localCheckingSession, setLocalCheckingSession] = useState(true)

  // Tabs: 'home' | 'bookings' | 'alerts' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'bookings' | 'alerts' | 'profile'>('home')

  // Auth local state
  const [isLoginMode, setIsLoginMode] = useState(true)

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [currentArea, setCurrentArea] = useState('')
  const [licenseNo, setLicenseNo] = useState('')

  // Multi-option login state
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  // Edit Profile local state
  const [editFullName, setEditFullName] = useState('')
  const [editPhone, setEditPhone] = useState('')

  const [editCurrentArea, setEditCurrentArea] = useState('')
  const [editLicenseNo, setEditLicenseNo] = useState('')

  // Selected Booking for Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Booking filtering: 'current' | 'history'
  const [bookingFilter, setBookingFilter] = useState<'current' | 'history'>('current')

  // Initial check with safety timeout to prevent infinite loader
  // (e.g. BFCache / back-button navigation state freezing)
  useEffect(() => {
    Promise.resolve(dispatch(checkDriverSession())).finally(() => {
      setLocalCheckingSession(false)
    })

    const timer = setTimeout(() => {
      setLocalCheckingSession(false)
    }, 10000)

    return () => clearTimeout(timer)
  }, [dispatch])

  // Fetch fresh data when tab changes, excluding when session is still checking
  useEffect(() => {
    if (!isAuthenticated || localCheckingSession) return

    if (activeTab === 'home') {
      dispatch(fetchDriverProfile())
      dispatch(fetchBookings())
      dispatch(fetchNotifications())
    } else if (activeTab === 'bookings') {
      dispatch(fetchBookings())
    } else if (activeTab === 'alerts') {
      dispatch(fetchNotifications())
    } else if (activeTab === 'profile') {
      dispatch(fetchDriverProfile())
    }
  }, [activeTab, isAuthenticated, localCheckingSession, dispatch])

  // Periodic session expiration checker (7 days limit check for drivers)
  useEffect(() => {
    if (!isAuthenticated) return

    const checkSessionExpiry = () => {
      const driverLoginTimeStr = localStorage.getItem('driver_login_time')
      if (driverLoginTimeStr) {
        const loginTime = parseInt(driverLoginTimeStr, 10)
        const now = Date.now()
        const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000
        if (now - loginTime > SEVEN_DAYS_IN_MS) {
          dispatch(logoutDriver())
          toast.error('Your session has expired. Please log in again.')
        }
      }
    }

    // Run immediately and then every 1 minute
    checkSessionExpiry()
    const interval = setInterval(checkSessionExpiry, 60000)
    return () => clearInterval(interval)
  }, [isAuthenticated, dispatch])

  // Enforce role isolation: drivers only
  useEffect(() => {
    if (isAuthenticated && info) {
      if (info.role !== 'DRIVER') {
        dispatch(logoutDriver())
        toast.error(`Access Denied: Invalid credentials or role mismatched.`)
      }
    }
  }, [isAuthenticated, info, dispatch])

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any = null
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    } else if (resendTimer === 0 && interval) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  // Real-time Supabase subscriptions when logged in and online
  useEffect(() => {
    if (!isAuthenticated || !isOnline || !info) return

    const bookingsSubscription = supabase
      .channel('realtime-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log('Realtime booking update:', payload)
          dispatch(fetchBookings())
        }
      )
      .subscribe()

    const notificationsSubscription = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('Realtime notification received:', payload)
          dispatch(fetchNotifications())
          if (payload.new && payload.new.title) {
            toast.info(`Alert: ${payload.new.title}`)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(bookingsSubscription)
      supabase.removeChannel(notificationsSubscription)
    }
  }, [isAuthenticated, isOnline, info, dispatch])

  // Initialize edit profile fields when user is loaded
  useEffect(() => {
    if (info) {
      setEditFullName(info.fullName)
      setEditPhone(info.phone)
      setEditCurrentArea(info.currentArea)
      setEditLicenseNo(info.licenseNo)
    }
  }, [info])

  // Register FCM Token for push notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated || !info || !info.id) return

    let unsubscribe: (() => void) | null = null

    const registerFcm = async () => {
      try {
        // Force session load/verification on Supabase client
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          console.warn('FCM registration delayed: Supabase session not fully loaded yet.')
          return
        }

        const { requestForToken, messaging } = await import('@/lib/firebase')
        const token = await requestForToken()
        if (token) {
          const { error } = await supabase
            .from('driver_fcm_tokens')
            .upsert({
              driver_id: user.id,
              fcm_token: token,
            }, { onConflict: 'fcm_token' })

          if (error) throw error
          console.log('FCM token registered successfully:', token)
        }

        if (messaging) {
          const { onMessage } = await import('firebase/messaging')
          unsubscribe = onMessage(messaging, (payload) => {
            console.log("Message received:", payload);
          })
        }
      } catch (err) {
        console.error('Failed to register FCM token or setup notification listener:', err)
      }
    }

    registerFcm()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [isAuthenticated, info, localCheckingSession])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoginMode) {
      if (loginMethod === 'password') {
        if (!phone) {
          toast.error('Please enter your mobile number')
          return
        }
        const normalizedPhone = normalizePhone(phone)
        const result = await dispatch(loginDriver({ phone: normalizedPhone, password }))
        if (loginDriver.fulfilled.match(result)) {
          toast.success(`Welcome back, ${result.payload.fullName}!`)
        } else {
          const errMsg = result.payload as string || 'Failed to login'
          toast.error(errMsg)
          setPassword('')
        }
      } else {
        // OTP Mode
        if (!phone) {
          toast.error('Please enter your mobile number')
          return
        }
        const normalizedPhone = normalizePhone(phone)
        if (!otpSent) {
          const result = await dispatch(sendDriverOtp(normalizedPhone))
          if (sendDriverOtp.fulfilled.match(result)) {
            setOtpSent(true)
            setResendTimer(30)
            toast.success('OTP sent successfully to your phone!')
          } else {
            const errMsg = result.payload as string || 'Failed to send OTP'
            toast.error(errMsg)
          }
        } else {
          if (!otpCode) {
            toast.error('Please enter the OTP code')
            return
          }
          const result = await dispatch(verifyDriverOtp({ phone: normalizedPhone, code: otpCode }))
          if (verifyDriverOtp.fulfilled.match(result)) {
            toast.success(`Welcome back, ${result.payload.fullName}!`)
          } else {
            const errMsg = result.payload as string || 'Failed to verify OTP'
            toast.error(errMsg)
            setOtpSent(false)
            setOtpCode('')
          }
        }
      }
    } else {
      if (!fullName || !phone || !licenseNo) {
        toast.error('Please fill out all required fields')
        return
      }
      const normalizedPhone = normalizePhone(phone)
      const result = await dispatch(
        signupDriver({
          fullName,
          phone: normalizedPhone,
          currentArea,
          licenseNo,
          password,
        })
      )
      if (signupDriver.fulfilled.match(result)) {
        toast.success('Registration successful! Please wait for admin approval.')
      } else {
        const errMsg = result.payload as string || 'Failed to register'
        toast.error(errMsg)
      }
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/driver-app',
        }
      })
      if (error) throw error
    } catch (err: any) {
      toast.error(err.message || 'Google Login failed')
    }
  }

  const handleResendOtp = async () => {
    if (!phone) {
      toast.error('Please enter your mobile number')
      return
    }
    const normalizedPhone = normalizePhone(phone)
    setResendTimer(30)
    const result = await dispatch(sendDriverOtp(normalizedPhone))
    if (sendDriverOtp.fulfilled.match(result)) {
      toast.success('OTP resent successfully!')
    } else {
      const errMsg = result.payload as string || 'Failed to resend OTP'
      toast.error(errMsg)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(
      updateDriverProfile({
        fullName: editFullName,
        phone: editPhone,
        currentArea: editCurrentArea,
        licenseNo: editLicenseNo,
      })
    )
    if (updateDriverProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully!')
    } else {
      toast.error('Failed to update profile')
    }
  }

  const handleToggleOnline = async () => {
    if (!info?.verified) {
      toast.error('Your account is not approved by the admin yet. Please wait for verification.')
      return
    }
    const result = await dispatch(toggleOnlineStatus())
    if (toggleOnlineStatus.fulfilled.match(result)) {
      const online = result.payload
      if (online) {
        toast.success('You are now ONLINE. Searching for bookings...')
        dispatch(fetchBookings())
      } else {
        toast.info('You are now OFFLINE.')
      }
    } else {
      toast.error('Failed to change online status')
    }
  }

  const handleRefreshBookings = async () => {
    if (!isOnline) {
      toast.error('Please go online to refresh bookings')
      return
    }
    const myPromise = dispatch(fetchBookings())
    toast.promise(myPromise, {
      loading: 'Fetching latest bookings...',
      success: 'Bookings list updated!',
      error: 'Failed to reload bookings. Please try again.',
    })
  }

  const handleOpenDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsModalOpen(true)
  }

  const handleAccept = async (bookingId: string) => {
    setIsModalOpen(false)
    setSelectedBooking(null)
    const result = await dispatch(acceptBooking(bookingId))
    if (acceptBooking.fulfilled.match(result)) {
      toast.success('Booking accepted! Customer details unlocked.', {
        duration: 5000,
      })
    } else {
      const errMsg = result.payload as string || 'Failed to accept booking. It may have been accepted by another driver.'
      toast.error(errMsg)
    }
  }

  const handleUpdateTripStatus = async (
    bookingId: string,
    tripStatus: string,
    paymentType?: 'CASH' | 'QR' | null,
    invoiceId?: string | null
  ) => {
    const result = await dispatch(updateTripStatus({ bookingId, tripStatus, paymentType, invoiceId }))
    if (updateTripStatus.fulfilled.match(result)) {
      toast.success('Trip status updated!')
    } else {
      toast.error('Failed to update trip status.')
    }
  }

  const handlePass = (bookingId: string) => {
    dispatch(passBooking(bookingId))
    setIsModalOpen(false)
    setSelectedBooking(null)
    toast.info('Booking ignored.')
  }

  const handleLogout = () => {
    dispatch(logoutDriver())
    toast.info('Logged out successfully.')
    setActiveTab('home')
  }

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  // Filter lists
  const currentDriverId = info?.id
  const availableBookings = bookings.filter((b) => b.status === 'available')
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted' && (!currentDriverId || b.driverId === currentDriverId))
  const completedBookings = bookings.filter((b) => b.status === 'completed' && (!currentDriverId || b.driverId === currentDriverId))
  const myTrips = [...acceptedBookings, ...completedBookings]

  // Calculate statistics dynamically based on driver profile and completed trips earnings
  const derivedStats = {
    trips: completedBookings.filter(b => b.tripStatus !== 'cancelled_by_driver' && b.tripStatus !== 'cancelled').length + acceptedBookings.length, // only non-cancelled completed trips + accepted ones
    earnings: completedBookings
      .filter(b => b.tripStatus !== 'cancelled_by_driver' && b.tripStatus !== 'cancelled')
      .reduce((acc, curr) => acc + curr.fare, 0), // only earnings of successful completed trips
  }

  // Render Loader while checking session (only if not already authenticated to prevent flash of loader)
  if (localCheckingSession && !isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-screen bg-slate-950 text-white relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

        <div className="z-10 flex flex-col items-center gap-5">
          <div className="w-46 flex items-center justify-center mb-2">
            <Image src={logoSd} alt="ScanDriver Logo" width={200} className="object-contain" loading='eager' />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-gold-light border-t-transparent rounded-full animate-spin" />
            <p className="text-base font-medium tracking-wide text-text-muted">
              Verifying session...
            </p>
          </div>
          <a href="">Reload </a>
        </div>
      </div>
    )
  }

  // Render Auth screen
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <AuthScreen
          handleAuth={handleAuth}
          handleGoogleLogin={handleGoogleLogin}
          handleResendOtp={handleResendOtp}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          fullName={fullName}
          setFullName={setFullName}
          phone={phone}
          setPhone={setPhone}
          currentArea={currentArea}
          setCurrentArea={setCurrentArea}
          licenseNo={licenseNo}
          setLicenseNo={setLicenseNo}
          isLoginMode={isLoginMode}
          setIsLoginMode={setIsLoginMode}
          loginMethod={loginMethod}
          setLoginMethod={setLoginMethod}
          otpSent={otpSent}
          setOtpSent={setOtpSent}
          otpCode={otpCode}
          setOtpCode={setOtpCode}
          resendTimer={resendTimer}
          loading={loading}
          error={error}
        />
      </>
    )
  }

  // Render Dashboard
  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      <Toaster position="top-center" richColors />

      {/* 1. Header */}
      <header className="px-5 py-4 border-b border-border/10 flex items-center justify-between bg-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          {activeTab !== 'home' && (
            <button
              onClick={() => setActiveTab('home')}
              className="p-1 rounded-full text-text-muted hover:text-foreground hover:bg-surface2 transition-all mr-1"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <span className="font-display font-bold text-xl tracking-wider text-gold-light">
            SCAN<span className="text-foreground">DRIVER</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Light/Dark Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full border border-border/10 text-text-muted hover:text-gold-light transition-colors"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notifications Icon with Badge */}
          <button
            onClick={() => {
              setActiveTab('alerts')
              dispatch(markAllNotificationsAsRead())
            }}
            className="relative p-2 rounded-full hover:bg-surface2 transition-all text-foreground"
          >
            <Bell size={18} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500 animate-pulse-dot" />
            )}
          </button>

          {/* User profile initials */}
          <button
            onClick={() => setActiveTab('profile')}
            className="h-8 w-8 rounded-full bg-gradient-to-tr from-gold to-yellow-500 text-black font-semibold text-sm flex items-center justify-center hover:opacity-90 transition-all border border-gold/30 shadow-md"
          >
            {info?.avatar || 'RK'}
          </button>
        </div>
      </header>

      {/* 2. Main Scrollable Container */}
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'home' && (
          <HomeTab
            info={info}
            isOnline={isOnline}
            loading={loading}
            handleToggleOnline={handleToggleOnline}
            onRefresh={handleRefreshBookings}
            stats={derivedStats}
            availableBookings={availableBookings}
            handleOpenDetails={handleOpenDetails}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsTab
            acceptedBookings={acceptedBookings}
            completedBookings={completedBookings}
            bookingFilter={bookingFilter}
            setBookingFilter={setBookingFilter}
            handleOpenDetails={handleOpenDetails}
            handleUpdateTripStatus={handleUpdateTripStatus}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsTab
            notifications={notifications}
            unreadNotificationsCount={unreadNotificationsCount}
            onMarkAllRead={() => {
              dispatch(markAllNotificationsAsRead())
              toast.success('Marked all notifications as read')
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            info={info}
            editFullName={editFullName}
            setEditFullName={setEditFullName}
            editPhone={editPhone}
            setEditPhone={setEditPhone}
            editCurrentArea={editCurrentArea}
            setEditCurrentArea={setEditCurrentArea}
            editLicenseNo={editLicenseNo}
            setEditLicenseNo={setEditLicenseNo}
            handleUpdateProfile={handleUpdateProfile}
            handleLogout={handleLogout}
          />
        )}
      </main>

      {/* 3. Bottom Tab Navigator */}
      <nav className="fixed bottom-0 sm:absolute left-0 right-0 z-40 bg-card/80 backdrop-blur-lg border-t border-border/15 px-6 py-2.5 flex items-center justify-between">
        <button
          onClick={() => setActiveTab('home')}
          className={cn(
            'flex flex-col items-center gap-1 transition-colors outline-none cursor-pointer',
            activeTab === 'home' ? 'text-primary' : 'text-text-muted hover:text-foreground'
          )}
        >
          <HomeIcon size={20} />
          <span className="text-[9px] uppercase tracking-wider font-bold">Home</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('bookings')
            setBookingFilter('current')
          }}
          className={cn(
            'flex flex-col items-center gap-1 transition-colors outline-none cursor-pointer',
            activeTab === 'bookings' ? 'text-primary' : 'text-text-muted hover:text-foreground'
          )}
        >
          <Briefcase size={20} />
          <span className="text-[9px] uppercase tracking-wider font-bold">Bookings</span>
        </button>

        {/* <button
          onClick={() => {
            setActiveTab('alerts')
            dispatch(markAllNotificationsAsRead())
          }}
          className={cn(
            'flex flex-col items-center gap-1 transition-colors outline-none cursor-pointer',
            activeTab === 'alerts' ? 'text-primary' : 'text-text-muted hover:text-foreground'
          )}
        >
          <div className="relative">
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-[9px] uppercase tracking-wider font-bold">Alerts</span>
        </button> */}

        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            'flex flex-col items-center gap-1 transition-colors outline-none cursor-pointer',
            activeTab === 'profile' ? 'text-primary' : 'text-text-muted hover:text-foreground'
          )}
        >
          <UserIcon size={20} />
          <span className="text-[9px] uppercase tracking-wider font-bold">Profile</span>
        </button>
      </nav>

      {/* 4. Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <BookingDetailModal
          isOpen={isModalOpen}
          booking={selectedBooking}
          onClose={() => setIsModalOpen(false)}
          onAccept={handleAccept}
          onPass={handlePass}
        />
      )}
    </div>
  )
}
