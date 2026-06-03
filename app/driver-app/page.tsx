'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from 'next-themes'
import {
  Home as HomeIcon,
  Briefcase,
  Bell,
  User as UserIcon,
  Power,
  ChevronRight,
  LogOut,
  MapPin,
  Calendar,
  Clock,
  Car,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Star,
  Check,
  Moon,
  Sun,
  ShieldCheck,
  Search,
  ArrowLeft,
  DollarSign,
  AlertTriangle,
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
  Booking,
} from '@/redux/slices/driverSlice'
import { cn } from '@/lib/utils'

export default function DriverApp() {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, isOnline, info, bookings, notifications, stats, loading, error } = useSelector(
    (state: RootState) => state.driver
  )
  const { theme, setTheme } = useTheme()

  // Tabs: 'home' | 'bookings' | 'alerts' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'bookings' | 'alerts' | 'profile'>('home')

  // Auth local state
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [currentArea, setCurrentArea] = useState('')
  const [licenseNo, setLicenseNo] = useState('')

  // Edit Profile local state
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editCurrentArea, setEditCurrentArea] = useState('')
  const [editLicenseNo, setEditLicenseNo] = useState('')

  // Selected Booking for Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Booking filtering: 'available' | 'trips'
  const [bookingFilter, setBookingFilter] = useState<'available' | 'trips'>('available')

  // Initial check
  useEffect(() => {
    dispatch(checkDriverSession())
  }, [dispatch])

  // Initialize edit profile fields when user is loaded
  useEffect(() => {
    if (info) {
      setEditFirstName(info.firstName)
      setEditLastName(info.lastName)
      setEditPhone(info.phone)
      setEditEmail(info.email)
      setEditCurrentArea(info.currentArea)
      setEditLicenseNo(info.licenseNo)
    }
  }, [info])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoginMode) {
      if (!email) {
        toast.error('Please enter email address')
        return
      }
      const result = await dispatch(loginDriver({ email }))
      if (loginDriver.fulfilled.match(result)) {
        toast.success(`Welcome back, ${result.payload.firstName}!`)
      } else {
        toast.error(error || 'Failed to login')
      }
    } else {
      if (!firstName || !lastName || !phone || !email || !licenseNo) {
        toast.error('Please fill out all required fields')
        return
      }
      const result = await dispatch(
        signupDriver({
          firstName,
          lastName,
          phone,
          email,
          currentArea,
          licenseNo,
        })
      )
      if (signupDriver.fulfilled.match(result)) {
        toast.success('Registration successful! Please wait for admin approval.')
      } else {
        toast.error(error || 'Failed to register')
      }
    }
  }

  const handleDemoLogin = async () => {
    setEmail('ramesh@email.com')
    const result = await dispatch(loginDriver({ email: 'ramesh@email.com' }))
    if (loginDriver.fulfilled.match(result)) {
      toast.success(`Demo Mode: Logged in as Ramesh Kumar`)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(
      updateDriverProfile({
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
        email: editEmail,
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

  const handleToggleOnline = () => {
    dispatch(toggleOnlineStatus())
    if (!isOnline) {
      toast.success('You are now ONLINE. Searching for bookings...')
    } else {
      toast.info('You are now OFFLINE.')
    }
  }

  const handleOpenDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsModalOpen(true)
  }

  const handleAccept = (bookingId: string) => {
    dispatch(acceptBooking(bookingId))
    setIsModalOpen(false)
    setSelectedBooking(null)
    toast.success('Booking accepted! Customer details unlocked.', {
      duration: 5000,
    })
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
  const availableBookings = bookings.filter((b) => b.status === 'available')
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted')
  const completedBookings = bookings.filter((b) => b.status === 'completed')
  const myTrips = [...acceptedBookings, ...completedBookings]

  // Render Auth screen
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-card relative">
        <Toaster position="top-center" richColors />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-slate-900 border border-gold/30 flex items-center justify-center">
              <span className="font-display font-bold text-xl text-gold-light">SD</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            ScanDriver Partner
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Your Driver One Scan Away – Driver Terminal
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-background/40 backdrop-blur-md py-8 px-6 shadow-xl border border-border/20 rounded-xl">
            {/* Login / Signup Selector */}
            <div className="flex rounded-lg bg-surface2 p-1 mb-6 border border-border/10">
              <button
                onClick={() => setIsLoginMode(true)}
                className={cn(
                  'flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all duration-300',
                  isLoginMode ? 'bg-primary text-black' : 'text-text-muted hover:text-foreground'
                )}
              >
                LOGIN
              </button>
              <button
                onClick={() => setIsLoginMode(false)}
                className={cn(
                  'flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all duration-300',
                  !isLoginMode ? 'bg-primary text-black' : 'text-text-muted hover:text-foreground'
                )}
              >
                SIGNUP
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleAuth}>
              {!isLoginMode && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                        placeholder="Ramesh"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                        placeholder="Kumar"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                      placeholder="+91-9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Current Area
                    </label>
                    <input
                      type="text"
                      required
                      value={currentArea}
                      onChange={(e) => setCurrentArea(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                      placeholder="Dwarka, Delhi"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Driving License No.
                    </label>
                    <input
                      type="text"
                      required
                      value={licenseNo}
                      onChange={(e) => setLicenseNo(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                      placeholder="DL-XXXXXXXXXXXXX"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                  placeholder="ramesh@email.com"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary text-black font-semibold text-sm rounded-md shadow-md hover:bg-gold-light transition-colors duration-300 flex items-center justify-center cursor-pointer"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : isLoginMode ? (
                  'LOG IN'
                ) : (
                  'SIGN UP'
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-text-muted">Or test driving app</span>
              </div>
            </div>

            <button
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 bg-transparent text-gold-light border border-gold/40 hover:bg-gold/5 font-semibold text-sm rounded-md shadow-md transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              Demo Partner Login
            </button>
          </div>
        </div>
      </div>
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
          <span className="font-display font-bold text-lg tracking-wider text-gold-light">
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
            className="h-8 w-8 rounded-full bg-gradient-to-tr from-gold to-yellow-500 text-black font-semibold text-xs flex items-center justify-center hover:opacity-90 transition-all border border-gold/30 shadow-md"
          >
            {info?.avatar || 'RK'}
          </button>
        </div>
      </header>

      {/* 2. Main Scrollable Container */}
      <main className="flex-1 overflow-y-auto pb-24">

        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="px-5 py-6 space-y-6">

            {/* Status card offline/online */}
            <div
              className={cn(
                'p-5 rounded-xl border transition-all duration-500 relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
                isOnline
                  ? 'bg-emerald-950/20 border-emerald-500/20'
                  : 'bg-card border-border/10'
              )}
            >
              <div className="space-y-1 relative z-10">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  Good afternoon, {info?.firstName}
                  <span className="animate-float">👋</span>
                </h3>
                <p className="text-xs text-text-muted flex items-center gap-1.5">
                  <span
                    className={cn(
                      'inline-block h-2 w-2 rounded-full',
                      isOnline ? 'bg-emerald-500 animate-pulse-dot' : 'bg-rose-500'
                    )}
                  />
                  You are currently {isOnline ? 'online and ready' : 'offline'}
                </p>
              </div>

              {/* iOS toggle style */}
              <div className="flex items-center gap-2 relative z-10 sm:self-center">
                <span className={cn('text-xs font-semibold tracking-wide uppercase', isOnline ? 'text-emerald-500' : 'text-text-muted')}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
                <button
                  onClick={handleToggleOnline}
                  className={cn(
                    'w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 outline-none',
                    isOnline ? 'bg-emerald-500' : 'bg-input'
                  )}
                >
                  <div
                    className={cn(
                      'bg-white dark:bg-black w-4.5 h-4.5 rounded-full shadow-md transform transition-all duration-300',
                      isOnline ? 'translate-x-6' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border border-border/10 p-3 rounded-lg text-center shadow-xs">
                <span className="block font-bold text-lg text-gold-light">{stats.trips}</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Today's Trips</span>
              </div>
              <div className="bg-card border border-border/10 p-3 rounded-lg text-center shadow-xs">
                <span className="block font-bold text-lg text-gold-light">₹{stats.earnings}</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Today's Earnings</span>
              </div>
              <div className="bg-card border border-border/10 p-3 rounded-lg text-center shadow-xs">
                <span className="block font-bold text-lg text-gold-light flex items-center justify-center gap-0.5">
                  {info?.rating} <Star size={12} className="fill-gold-light text-gold-light" />
                </span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Your Rating</span>
              </div>
            </div>

            {/* AVAILABLE BOOKINGS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted">
                  Available Bookings
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-surface2 border border-border/15 text-[10px] font-semibold text-gold-light">
                  {isOnline ? availableBookings.length : 0} available
                </span>
              </div>

              {!isOnline ? (
                /* Offline State */
                <div className="bg-card/40 border border-dashed border-border/10 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 transition-all duration-300">
                  <div className="h-12 w-12 rounded-full bg-surface2 border border-border/10 flex items-center justify-center text-text-muted">
                    <Search size={22} className="animate-float" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Go Online to See Bookings</h4>
                    <p className="text-xs text-text-muted max-w-[240px] mx-auto leading-relaxed">
                      Toggle online status above to start receiving booking requests in Delhi NCR.
                    </p>
                  </div>
                </div>
              ) : availableBookings.length === 0 ? (
                /* Online and Loading State / Empty */
                <div className="bg-card/40 border border-border/10 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="h-10 w-10 border-2 border-gold/30 border-t-primary rounded-full animate-spin" />
                    <Search size={14} className="absolute inset-0 m-auto text-gold-light" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Searching for rides...</h4>
                    <p className="text-xs text-text-muted max-w-[220px] mx-auto leading-relaxed">
                      Keep this page open. We are scanning available client requests in your area.
                    </p>
                  </div>
                </div>
              ) : (
                /* Bookings List when online */
                <div className="space-y-3">
                  {availableBookings.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => handleOpenDetails(booking)}
                      className="bg-card border border-border/15 rounded-xl p-4 shadow-sm hover:border-gold/30 cursor-pointer active:scale-[0.99] transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-text-muted tracking-wider block">
                            {booking.id}
                          </span>
                          <h4 className="font-bold text-sm text-foreground group-hover:text-gold-light transition-colors">
                            {booking.customerName}
                          </h4>
                        </div>
                        <span
                          className={cn(
                            'text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider',
                            booking.type === 'AIRPORT DROP'
                              ? 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                              : booking.type === 'OUTSTATION'
                                ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          )}
                        >
                          {booking.type}
                        </span>
                      </div>

                      {/* Route vertical line style */}
                      <div className="space-y-3.5 relative pl-4 before:content-[''] before:absolute before:left-1 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-border/25">
                        {/* Pickup */}
                        <div className="relative">
                          <span className="absolute -left-4.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
                          <p className="text-xs text-foreground font-semibold leading-none mb-1">Pickup</p>
                          <p className="text-[11px] text-text-muted truncate">{booking.pickup}</p>
                        </div>
                        {/* Drop */}
                        <div className="relative">
                          <span className="absolute -left-4.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 ring-4 ring-amber-500/10" />
                          <p className="text-xs text-foreground font-semibold leading-none mb-1">Drop</p>
                          <p className="text-[11px] text-text-muted truncate">{booking.drop}</p>
                        </div>
                      </div>

                      <div className="border-t border-border/10 mt-4 pt-3 flex items-center justify-between text-[11px] text-text-muted">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {booking.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {booking.distance}
                          </span>
                        </div>
                        <span className="font-bold text-sm text-emerald-500">
                          ₹{booking.fare}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="px-5 py-6 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              All Bookings
            </h2>

            {/* Filter Buttons */}
            <div className="flex bg-surface2 p-1 rounded-lg border border-border/10">
              <button
                onClick={() => setBookingFilter('available')}
                className={cn(
                  'flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all duration-300',
                  bookingFilter === 'available' ? 'bg-primary text-black' : 'text-text-muted hover:text-foreground'
                )}
              >
                Available Rides ({availableBookings.length})
              </button>
              <button
                onClick={() => setBookingFilter('trips')}
                className={cn(
                  'flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all duration-300',
                  bookingFilter === 'trips' ? 'bg-primary text-black' : 'text-text-muted hover:text-foreground'
                )}
              >
                My Trips ({myTrips.length})
              </button>
            </div>

            {bookingFilter === 'available' ? (
              /* Available List */
              availableBookings.length === 0 ? (
                <div className="bg-card border border-border/10 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 text-text-muted">
                  <Briefcase size={24} className="opacity-40" />
                  <p className="text-xs">No available bookings right now.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableBookings.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => handleOpenDetails(booking)}
                      className="bg-card border border-border/15 rounded-xl p-4 shadow-sm hover:border-gold/30 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-text-muted tracking-wider">
                          {booking.id}
                        </span>
                        <span
                          className={cn(
                            'text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider',
                            booking.type === 'AIRPORT DROP'
                              ? 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                              : booking.type === 'OUTSTATION'
                                ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          )}
                        >
                          {booking.type}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-foreground mb-3">{booking.customerName}</h4>

                      <div className="space-y-3 relative pl-4 before:content-[''] before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/25">
                        <div className="relative">
                          <span className="absolute -left-4.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <p className="text-[11px] text-text-muted truncate">{booking.pickup}</p>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-4.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <p className="text-[11px] text-text-muted truncate">{booking.drop}</p>
                        </div>
                      </div>

                      <div className="border-t border-border/10 mt-4 pt-3 flex items-center justify-between text-[11px] text-text-muted">
                        <span className="font-semibold text-xs text-foreground">
                          {booking.dateTime}
                        </span>
                        <span className="font-bold text-sm text-emerald-500">
                          ₹{booking.fare}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* My Trips List (Accepted or Completed) */
              myTrips.length === 0 ? (
                <div className="bg-card border border-border/10 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 text-text-muted">
                  <Briefcase size={24} className="opacity-40" />
                  <p className="text-xs">You haven't accepted any trips yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myTrips.map((booking) => (
                    <div
                      key={booking.id}
                      className={cn(
                        'bg-card border rounded-xl p-4 shadow-sm relative overflow-hidden',
                        booking.status === 'accepted' ? 'border-primary/20' : 'border-border/10'
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-text-muted tracking-wider">
                          {booking.id}
                        </span>
                        <span
                          className={cn(
                            'text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider',
                            booking.status === 'accepted'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20'
                          )}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-foreground mb-3">{booking.customerName}</h4>

                      <div className="space-y-3 relative pl-4 before:content-[''] before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/25">
                        <div className="relative">
                          <span className="absolute -left-4.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <p className="text-[11px] text-text-muted truncate">{booking.pickup}</p>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-4.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <p className="text-[11px] text-text-muted truncate">{booking.drop}</p>
                        </div>
                      </div>

                      {/* Customer info unlocked */}
                      <div className="mt-4 pt-3 border-t border-border/10 text-xs space-y-1.5 text-text-muted">
                        <p className="flex justify-between">
                          <span>Phone:</span>
                          <a href={`tel:${booking.phone}`} className="font-semibold text-gold-light hover:underline">
                            {booking.phone}
                          </a>
                        </p>
                        <p className="flex justify-between">
                          <span>Vehicle:</span>
                          <span className="text-foreground font-semibold">{booking.vehicle}</span>
                        </p>
                      </div>

                      <div className="border-t border-border/10 mt-3 pt-3 flex items-center justify-between text-[11px] text-text-muted">
                        <span className="font-semibold text-xs text-foreground">
                          {booking.dateTime}
                        </span>
                        <span className="font-bold text-sm text-emerald-500">
                          ₹{booking.fare}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        )}

        {/* TAB 3: ALERTS (Notifications) */}
        {activeTab === 'alerts' && (
          <div className="px-5 py-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
                Notifications
              </h2>
              {unreadNotificationsCount > 0 && (
                <button
                  onClick={() => {
                    dispatch(markAllNotificationsAsRead())
                    toast.success('Marked all notifications as read')
                  }}
                  className="text-xs text-gold-light hover:underline font-semibold"
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="bg-card border border-border/10 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 text-text-muted">
                <Bell size={24} className="opacity-40" />
                <p className="text-xs">No alerts yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      'bg-card border rounded-xl p-4 shadow-xs relative flex items-start gap-3 transition-colors duration-300',
                      notif.read ? 'border-border/10 opacity-75' : 'border-border/20'
                    )}
                  >
                    {/* Circle badge based on type */}
                    <div
                      className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center shrink-0 border',
                        notif.type === 'booking'
                          ? 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                          : notif.type === 'system'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : notif.type === 'rating'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                      )}
                    >
                      {notif.type === 'booking' && <Briefcase size={14} />}
                      {notif.type === 'system' && <CheckCircle size={14} />}
                      {notif.type === 'rating' && <Star size={14} className="fill-amber-500" />}
                      {notif.type === 'payout' && <DollarSign size={14} />}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-xs text-foreground leading-snug">
                          {notif.title}
                        </h4>
                        <span className="text-[9px] text-text-muted">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        {notif.description}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notif.read && (
                      <span className="absolute right-3 bottom-3 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <div className="px-5 py-6 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              My Profile
            </h2>

            {/* Profile Welcome Box */}
            <div className="bg-card border border-border/10 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl" />

              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-gold to-yellow-500 text-black font-bold text-xl flex items-center justify-center shadow-lg border border-gold/20 shrink-0">
                {info?.avatar}
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground leading-none">
                  {info?.firstName} {info?.lastName}
                </h3>
                <p className="text-xs text-text-muted">{info?.email}</p>
                <div className="flex items-center gap-1 pt-1">
                  {info?.verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                      <ShieldCheck size={10} /> Verified Driver
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] font-bold text-rose-500 uppercase tracking-wider">
                      <AlertTriangle size={10} /> Pending Verification
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile fields form */}
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted border-b border-border/10 pb-2">
                  Personal Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Current Area
                  </label>
                  <input
                    type="text"
                    required
                    value={editCurrentArea}
                    onChange={(e) => setEditCurrentArea(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted border-b border-border/10 pb-2">
                  License & Vehicle Info
                </h3>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Driving License No.
                  </label>
                  <input
                    type="text"
                    required
                    value={editLicenseNo}
                    onChange={(e) => setEditLicenseNo(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-primary text-black font-semibold text-sm rounded-md shadow-md hover:bg-gold-light transition-colors duration-300 flex items-center justify-center cursor-pointer"
                >
                  Save Profile Changes
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 bg-surface2 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 border border-border/20 hover:border-rose-500/20 font-semibold text-sm rounded-md shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </form>
          </div>
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
            setBookingFilter('available')
          }}
          className={cn(
            'flex flex-col items-center gap-1 transition-colors outline-none cursor-pointer',
            activeTab === 'bookings' ? 'text-primary' : 'text-text-muted hover:text-foreground'
          )}
        >
          <Briefcase size={20} />
          <span className="text-[9px] uppercase tracking-wider font-bold">Bookings</span>
        </button>

        <button
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
        </button>

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

      {/* 4. Booking Details Modal (Drawer-like overlay) */}
      {isModalOpen && selectedBooking && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center transition-all duration-300 animate-in fade-in">
          {/* Backdrop Closer */}
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

          {/* Modal Container */}
          <div className="relative w-full bg-card border-t border-border/20 rounded-t-2xl max-h-[85%] overflow-y-auto px-5 pt-6 pb-8 shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
            {/* Grab handle indicator */}
            <div className="w-12 h-1 bg-border/20 rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between border-b border-border/10 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                  {selectedBooking.id} Details
                </span>
                <h3 className="font-bold text-lg text-foreground font-sans">
                  Trip Information
                </h3>
              </div>
              <span
                className={cn(
                  'text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border',
                  selectedBooking.type === 'AIRPORT DROP'
                    ? 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                    : selectedBooking.type === 'OUTSTATION'
                      ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                )}
              >
                {selectedBooking.type}
              </span>
            </div>

            {/* Fare callout */}
            <div className="bg-surface2/60 border border-border/10 p-3 rounded-lg flex items-center justify-between mb-5">
              <span className="text-xs text-text-muted font-medium">Estimated Earnings</span>
              <span className="font-bold text-xl text-emerald-500">₹{selectedBooking.fare}</span>
            </div>

            <div className="space-y-5 flex-1">
              {/* Customer Info */}
              <div className="space-y-3.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-muted">
                  Customer & Trip
                </h4>

                <div className="space-y-4">
                  {/* Customer Name */}
                  <div className="flex gap-3">
                    <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                      <UserIcon size={14} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-text-muted leading-none">Customer Name</p>
                      <p className="text-xs font-semibold text-foreground">{selectedBooking.customerName}</p>
                    </div>
                  </div>

                  {/* Phone Masked */}
                  <div className="flex gap-3">
                    <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                      <FileText size={14} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-text-muted leading-none">Phone (shared after acceptance)</p>
                      <p className="text-xs font-mono font-semibold tracking-wider text-text-muted">
                        {selectedBooking.status === 'accepted' ? selectedBooking.phone : '**********'}
                      </p>
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="flex gap-3">
                    <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                      <MapPin size={14} className="text-emerald-500" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-text-muted leading-none">Pickup From</p>
                      <p className="text-xs font-semibold text-foreground leading-normal">{selectedBooking.pickup}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                      <MapPin size={14} className="text-amber-500" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-text-muted leading-none">Drop To</p>
                      <p className="text-xs font-semibold text-foreground leading-normal">{selectedBooking.drop}</p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex gap-3">
                    <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                      <Calendar size={14} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-text-muted leading-none">Date & Time</p>
                      <p className="text-xs font-semibold text-foreground">{selectedBooking.dateTime}</p>
                    </div>
                  </div>

                  {/* Duration / Distance */}
                  <div className="flex gap-3">
                    <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                      <Clock size={14} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-text-muted leading-none">Duration / Distance</p>
                      <p className="text-xs font-semibold text-foreground">
                        ~{selectedBooking.duration} • {selectedBooking.distance}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle & Notes */}
              <div className="space-y-3.5 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-muted">
                  Vehicle & Notes
                </h4>

                <div className="space-y-4">
                  {/* Client Vehicle */}
                  <div className="flex gap-3">
                    <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                      <Car size={14} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-text-muted leading-none">Client Vehicle</p>
                      <p className="text-xs font-semibold text-foreground">
                        {selectedBooking.status === 'accepted' ? selectedBooking.vehicle : 'Honda City - HR26-AB1234 (Masked)'}
                      </p>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="flex gap-3">
                    <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                      <FileText size={14} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-text-muted leading-none">Special Instructions</p>
                      <p className="text-xs italic text-foreground leading-normal">
                        "{selectedBooking.specialInstructions}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {selectedBooking.status === 'available' ? (
                <>
                  <button
                    onClick={() => handleAccept(selectedBooking.id)}
                    className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check size={16} /> ACCEPT
                  </button>
                  <button
                    onClick={() => handlePass(selectedBooking.id)}
                    className="py-3 px-4 bg-surface2 hover:bg-surface2/80 text-text-muted font-bold text-sm rounded-lg shadow-sm border border-border/15 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle size={16} /> PASS
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="col-span-2 py-3 px-4 bg-surface2 hover:bg-surface2/80 text-foreground font-bold text-sm rounded-lg shadow-sm border border-border/15 transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                  CLOSE DETAILS
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
