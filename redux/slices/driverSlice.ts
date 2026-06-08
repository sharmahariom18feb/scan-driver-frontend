import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabaseClient'

/**
 * Normalizes a phone number to standard E.164 format (e.g. +919876543210)
 */
export const normalizePhone = (phone: string): string => {
  let cleaned = phone.trim()
  if (cleaned.startsWith('0') && cleaned.replace(/\D/g, '').length === 11) {
    cleaned = cleaned.substring(1)
  }
  const digits = cleaned.replace(/\D/g, '')
  if (cleaned.startsWith('+')) {
    return '+' + digits
  }
  if (digits.length === 10) {
    return '+91' + digits
  }
  return '+' + digits
}

export interface Booking {
  id: string
  customerName: string
  phone: string
  pickup: string
  drop: string
  dateTime: string
  duration: string
  distance: string
  fare: number
  vehicle: string
  specialInstructions: string
  status: 'available' | 'accepted' | 'passed' | 'completed'
  type: 'AIRPORT DROP' | 'HOURLY' | 'OUTSTATION'
  driverId?: string | null
  adminApproved?: boolean
}

export interface DriverNotification {
  id: string
  title: string
  description: string
  time: string
  type: 'booking' | 'system' | 'rating' | 'payout'
  read: boolean
}

export interface DriverInfo {
  id?: string
  firstName: string
  lastName: string
  phone: string
  email: string
  currentArea: string
  licenseNo: string
  rating: number
  verified: boolean
  avatar: string
  role?: 'ADMIN' | 'DRIVER' | 'CUSTOMER'
  isOnline?: boolean
}

export interface DriverState {
  isAuthenticated: boolean
  isOnline: boolean
  info: DriverInfo | null
  bookings: Booking[]
  notifications: DriverNotification[]
  stats: {
    trips: number
    earnings: number
  }
  loading: boolean
  error: string | null
  checkingSession: boolean
}

const initialState: DriverState = {
  isAuthenticated: false,
  isOnline: false,
  info: null,
  bookings: [],
  notifications: [],
  stats: {
    trips: 0,
    earnings: 0,
  },
  loading: false,
  error: null,
  checkingSession: true,
}

// 1. Fetch bookings from Supabase
export const fetchBookings = createAsyncThunk(
  'driver/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      let query = supabase.from('bookings').select('*')

      if (session?.user) {
        query = query.eq('admin_approved', true).or(`status.eq.available,driver_id.eq.${session.user.id}`)
      } else {
        query = query.eq('status', 'available').eq('admin_approved', true)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      if (!data) return []

      // Fetch passed bookings for current driver if logged in
      let passedIds: string[] = []
      if (session?.user) {
        const { data: passedData } = await supabase
          .from('passed_bookings')
          .select('booking_id')
          .eq('driver_id', session.user.id)
        if (passedData) {
          passedIds = passedData.map((pb: any) => pb.booking_id)
        }
      }

      return data.map((b: any) => ({
        id: b.id,
        customerName: b.customer_name,
        phone: b.phone,
        pickup: b.pickup,
        drop: b.drop,
        dateTime: b.date_time,
        duration: b.duration,
        distance: b.distance,
        fare: Number(b.fare),
        vehicle: b.vehicle,
        specialInstructions: b.special_instructions || '',
        status: (passedIds.includes(b.id) && b.status === 'available') ? 'passed' : b.status,
        type: b.type,
        driverId: b.driver_id,
        adminApproved: b.admin_approved,
      })) as Booking[]
    } catch (err: any) {
      console.error('Supabase fetchBookings error:', err)
      return rejectWithValue(err.message || 'Failed to fetch bookings')
    }
  }
)

// 2. Fetch notifications from Supabase
export const fetchNotifications = createAsyncThunk(
  'driver/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return []

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('driver_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!data) return []

      return data.map((n: any) => ({
        id: n.id,
        title: n.title,
        description: n.description,
        time: n.time,
        type: n.type,
        read: n.read,
      })) as DriverNotification[]
    } catch (err: any) {
      console.error('Supabase fetchNotifications error:', err)
      return rejectWithValue(err.message || 'Failed to fetch notifications')
    }
  }
)

// 3. Login driver thunk with password authentication (supports email or username)
export const loginDriver = createAsyncThunk(
  'driver/login',
  async (credentials: { emailOrUsername: string; password?: string }, { dispatch, rejectWithValue }) => {
    try {
      let email = credentials.emailOrUsername

      // If it doesn't look like an email, resolve username to email via RPC
      if (!email.includes('@')) {
        const { data: resolvedEmail, error: rpcError } = await supabase
          .rpc('get_email_by_username', { p_username: email })

        if (rpcError) throw rpcError
        if (!resolvedEmail) throw new Error('Username not found')
        email = resolvedEmail
      }

      // Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: credentials.password || '',
      })

      if (error) throw error

      const user = data.user
      if (!user) throw new Error('No user data returned')

      // Fetch driver profile info from users table and validate role
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .eq('role', 'DRIVER') // Enforce DRIVER role check on backend
        .single()

      if (profileError || !profile) {
        await supabase.auth.signOut()
        throw new Error('Access Denied: Invalid credentials or role mismatched.')
      }

      if (profile.role !== 'DRIVER') {
        await supabase.auth.signOut()
        throw new Error('Access Denied: Only driver accounts are allowed to log in.')
      }

      const driverInfo: DriverInfo = {
        id: user.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        email: user.email || email,
        currentArea: profile.current_area,
        licenseNo: profile.license_no,
        rating: Number(profile.rating),
        verified: profile.verified,
        avatar: (profile.first_name?.[0] || '') + (profile.last_name?.[0] || ''),
        role: profile.role,
        isOnline: profile.is_online,
      }

      localStorage.setItem('driver_session', JSON.stringify(driverInfo))
      localStorage.setItem('driver_login_time', Date.now().toString())

      // Load user's bookings and notifications
      dispatch(fetchBookings())
      dispatch(fetchNotifications())

      return driverInfo
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed')
    }
  }
)

// 3a. Send OTP thunk
export const sendDriverOtp = createAsyncThunk(
  'driver/sendOtp',
  async (phone: string, { rejectWithValue }) => {
    try {
      const normalizedPhone = normalizePhone(phone)

      // First check if user exists in public.users with role DRIVER
      const { data: exists, error: rpcError } = await supabase
        .rpc('check_user_exists_by_phone', { p_phone: normalizedPhone, p_role: 'DRIVER' })

      if (rpcError) throw rpcError
      if (!exists) {
        throw new Error('No driver account found with this phone number. Please enter the register number.')
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
      })
      if (error) throw error
      return normalizedPhone
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to send OTP')
    }
  }
)

// 3b. Verify OTP thunk
export const verifyDriverOtp = createAsyncThunk(
  'driver/verifyOtp',
  async ({ phone, code }: { phone: string; code: string }, { dispatch, rejectWithValue }) => {
    try {
      const normalizedPhone = normalizePhone(phone)
      const { data, error } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: code,
        type: 'sms',
      })
      if (error) throw error
      const user = data.user
      if (!user) throw new Error('Authentication failed')

      // Fetch driver profile info from users table and validate role
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .eq('role', 'DRIVER') // Enforce DRIVER role check on backend
        .single()

      if (profileError || !profile) {
        await supabase.auth.signOut()
        throw new Error('Access Denied: Invalid credentials or role mismatched.')
      }

      if (profile.role !== 'DRIVER') {
        await supabase.auth.signOut()
        throw new Error('Access Denied: Only driver accounts are allowed to log in.')
      }

      const driverInfo: DriverInfo = {
        id: user.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        email: user.email || profile.email || '',
        currentArea: profile.current_area,
        licenseNo: profile.license_no,
        rating: Number(profile.rating),
        verified: profile.verified,
        avatar: (profile.first_name?.[0] || '') + (profile.last_name?.[0] || ''),
        role: profile.role,
        isOnline: profile.is_online,
      }

      localStorage.setItem('driver_session', JSON.stringify(driverInfo))
      localStorage.setItem('driver_login_time', Date.now().toString())

      // Load user's bookings and notifications
      dispatch(fetchBookings())
      dispatch(fetchNotifications())

      return driverInfo
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to verify OTP')
    }
  }
)

// 4. Signup driver thunk
export const signupDriver = createAsyncThunk(
  'driver/signup',
  async (profileData: Partial<DriverInfo> & { password?: string }, { rejectWithValue }) => {
    try {
      const email = profileData.email || ''
      const password = profileData.password || ''
      const normalizedPhone = normalizePhone(profileData.phone || '')

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            phone: normalizedPhone,
            license_no: profileData.licenseNo,
            current_area: profileData.currentArea,
            role: 'DRIVER',
          }
        }
      })

      if (error) throw error
      const user = data.user
      if (!user) throw new Error('Signup failed')

      const newDriver: DriverInfo = {
        id: user.id,
        firstName: profileData.firstName || 'New',
        lastName: profileData.lastName || 'Driver',
        phone: normalizedPhone || '+91-0000000000',
        email: profileData.email || 'partner@scandriver.in',
        currentArea: profileData.currentArea || 'Delhi NCR',
        licenseNo: profileData.licenseNo || 'DL-XXXXXXXXXXXXX',
        rating: 5.0,
        verified: false,
        avatar: (profileData.firstName?.[0] || 'N') + (profileData.lastName?.[0] || 'D'),
        role: 'DRIVER',
      }

      localStorage.setItem('driver_session', JSON.stringify(newDriver))
      localStorage.setItem('driver_login_time', Date.now().toString())
      return newDriver
    } catch (err: any) {
      return rejectWithValue(err.message || 'Signup failed')
    }
  }
)

// 5. Check active session
export const checkDriverSession = createAsyncThunk(
  'driver/checkSession',
  async (_, { dispatch }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      // Check 7-day session expiry limit
      const driverLoginTimeStr = localStorage.getItem('driver_login_time')
      const now = Date.now()
      const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000

      if (driverLoginTimeStr) {
        const loginTime = parseInt(driverLoginTimeStr, 10)
        if (now - loginTime > SEVEN_DAYS_IN_MS) {
          // Expired
          await supabase.auth.signOut()
          localStorage.removeItem('driver_session')
          localStorage.removeItem('driver_login_time')
          return null
        }
      }

      if (session && session.user) {
        // Fallback: If session exists but no login time is recorded, initialize it
        if (!driverLoginTimeStr) {
          localStorage.setItem('driver_login_time', now.toString())
        }

        const user = session.user
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .eq('role', 'DRIVER') // Enforce DRIVER role check on backend
          .single()

        if (profile && profile.role === 'DRIVER') {
          const driverInfo = {
            id: user.id,
            firstName: profile.first_name,
            lastName: profile.last_name,
            phone: profile.phone,
            email: user.email || '',
            currentArea: profile.current_area,
            licenseNo: profile.license_no,
            rating: Number(profile.rating),
            verified: profile.verified,
            avatar: (profile.first_name?.[0] || '') + (profile.last_name?.[0] || ''),
            role: profile.role,
            isOnline: profile.is_online,
          } as DriverInfo

          dispatch(fetchBookings())
          dispatch(fetchNotifications())
          return driverInfo
        } else {
          // Clean up auth session if profile not found or user is not a DRIVER
          await supabase.auth.signOut()
          localStorage.removeItem('driver_session')
          localStorage.removeItem('driver_login_time')
          return null
        }
      }

      // Check local storage session for demo modes
      const localSession = localStorage.getItem('driver_session')
      if (localSession) {
        if (driverLoginTimeStr) {
          const loginTime = parseInt(driverLoginTimeStr, 10)
          if (now - loginTime > SEVEN_DAYS_IN_MS) {
            localStorage.removeItem('driver_session')
            localStorage.removeItem('driver_login_time')
            return null
          }
        }
        return JSON.parse(localSession) as DriverInfo
      }
      return null
    } catch (err) {
      const localSession = localStorage.getItem('driver_session')
      if (localSession) {
        const driverLoginTimeStr = localStorage.getItem('driver_login_time')
        const now = Date.now()
        const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000
        if (driverLoginTimeStr) {
          const loginTime = parseInt(driverLoginTimeStr, 10)
          if (now - loginTime > SEVEN_DAYS_IN_MS) {
            localStorage.removeItem('driver_session')
            localStorage.removeItem('driver_login_time')
            return null
          }
        }
        return JSON.parse(localSession) as DriverInfo
      }
      return null
    }
  }
)

// 6. Update driver profile
export const updateDriverProfile = createAsyncThunk(
  'driver/updateProfile',
  async (updatedData: Partial<DriverInfo>, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: updatedData.firstName,
          last_name: updatedData.lastName,
          phone: updatedData.phone,
          license_no: updatedData.licenseNo,
          current_area: updatedData.currentArea,
        })
        .eq('id', session.user.id)
        .select()
        .single()

      if (error) throw error

      const driverInfo: DriverInfo = {
        id: session.user.id,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        email: session.user.email || '',
        currentArea: data.current_area,
        licenseNo: data.license_no,
        rating: Number(data.rating),
        verified: data.verified,
        avatar: (data.first_name?.[0] || '') + (data.last_name?.[0] || ''),
        role: data.role,
      }

      localStorage.setItem('driver_session', JSON.stringify(driverInfo))
      return driverInfo
    } catch (err: any) {
      // Local storage update fallback
      const localSession = localStorage.getItem('driver_session')
      if (localSession) {
        const current = JSON.parse(localSession) as DriverInfo
        const merged = { ...current, ...updatedData }
        localStorage.setItem('driver_session', JSON.stringify(merged))
        return merged
      }
      return rejectWithValue(err.message || 'Update profile failed')
    }
  }
)

// 7. Toggle Online Status Thunk
export const toggleOnlineStatus = createAsyncThunk(
  'driver/toggleOnlineStatus',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const state = getState() as { driver: DriverState }
      const newOnlineStatus = !state.driver.isOnline

      if (session) {
        const { error } = await supabase
          .from('users')
          .update({ is_online: newOnlineStatus })
          .eq('id', session.user.id)

        if (error) throw error

        const id = 'N-' + Date.now()
        const notificationTitle = newOnlineStatus ? 'You are now Online' : 'You are now Offline'
        const notificationDesc = newOnlineStatus
          ? 'You will receive notifications of available bookings near you.'
          : 'Go online to start receiving booking requests.'

        await supabase
          .from('notifications')
          .insert({
            driver_id: session.user.id,
            title: notificationTitle,
            description: notificationDesc,
            time: 'Just now',
            type: 'system',
            read: false,
          })
      }

      return newOnlineStatus
    } catch (err: any) {
      console.warn('Supabase toggleOnlineStatus failed, using local fallback:', err)
      const state = getState() as { driver: DriverState }
      return !state.driver.isOnline
    }
  }
)

// 8. Accept Booking Thunk
export const acceptBooking = createAsyncThunk(
  'driver/acceptBooking',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Call postgres safe acceptance RPC to handle row locking (FOR UPDATE) and check status
      const { data, error } = await supabase.rpc('accept_booking_safe', {
        p_booking_id: bookingId,
        p_driver_id: session.user.id,
      })

      if (error) throw error

      if (data && !data.success) {
        throw new Error(data.message || 'Booking is no longer available')
      }

      const booking = data.booking

      return {
        id: booking.id,
        customerName: booking.customer_name,
        phone: booking.phone,
        pickup: booking.pickup,
        drop: booking.drop,
        dateTime: booking.date_time,
        duration: booking.duration,
        distance: booking.distance,
        fare: Number(booking.fare),
        vehicle: booking.vehicle,
        specialInstructions: booking.special_instructions || '',
        status: booking.status,
        type: booking.type,
        driverId: booking.driver_id,
        adminApproved: booking.admin_approved,
      } as Booking
    } catch (err: any) {
      console.warn('Supabase acceptBooking failed:', err)
      return rejectWithValue(err.message || 'Accept booking failed')
    }
  }
)

// 8b. Pass Booking Thunk
export const passBooking = createAsyncThunk(
  'driver/passBooking',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('passed_bookings')
        .insert({
          driver_id: session.user.id,
          booking_id: bookingId,
        })

      if (error) throw error

      return bookingId
    } catch (err: any) {
      console.warn('Supabase passBooking failed, using local fallback:', err)
      return bookingId
    }
  }
)

// 9. Mark notifications as read thunk
export const markAllNotificationsAsRead = createAsyncThunk(
  'driver/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('driver_id', session.user.id)
          .eq('read', false)
      }
      return true
    } catch (err: any) {
      console.warn('Supabase markAllNotificationsAsRead failed, updating locally:', err)
      return true
    }
  }
)

// 10. Logout driver thunk
export const logoutDriver = createAsyncThunk(
  'driver/logout',
  async (_, { rejectWithValue }) => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('driver_session')
      localStorage.removeItem('driver_login_time')
      return true
    } catch (err: any) {
      localStorage.removeItem('driver_session')
      localStorage.removeItem('driver_login_time')
      return true
    }
  }
)

export const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    // Allows real-time channels to push bookings directly to store
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload
    },
    updateBookingState: (state, action: PayloadAction<Booking>) => {
      const index = state.bookings.findIndex((b) => b.id === action.payload.id)
      if (index !== -1) {
        state.bookings[index] = action.payload
      } else {
        state.bookings.unshift(action.payload)
      }
    },
    // Allows real-time channels to push notifications directly to store
    setNotifications: (state, action: PayloadAction<DriverNotification[]>) => {
      state.notifications = action.payload
    },
    updateNotificationState: (state, action: PayloadAction<DriverNotification>) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload.id)
      if (index !== -1) {
        state.notifications[index] = action.payload
      } else {
        state.notifications.unshift(action.payload)
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Bookings
    builder.addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload
    })

    // Fetch Notifications
    builder.addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<DriverNotification[]>) => {
      state.notifications = action.payload
    })

    // Login
    builder.addCase(loginDriver.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(loginDriver.fulfilled, (state, action: PayloadAction<DriverInfo>) => {
      state.loading = false
      state.isAuthenticated = true
      state.info = action.payload
      state.isOnline = action.payload.isOnline ?? false
      state.stats = {
        trips: state.bookings.filter(b => b.status === 'accepted' || b.status === 'completed').length,
        earnings: state.bookings
          .filter(b => b.status === 'accepted' || b.status === 'completed')
          .reduce((acc, curr) => acc + curr.fare, 0),
      }
    })
    builder.addCase(loginDriver.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string || 'Login failed'
    })

    // Send OTP
    builder.addCase(sendDriverOtp.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(sendDriverOtp.fulfilled, (state) => {
      state.loading = false
    })
    builder.addCase(sendDriverOtp.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string || 'Failed to send OTP'
    })

    // Verify OTP
    builder.addCase(verifyDriverOtp.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(verifyDriverOtp.fulfilled, (state, action: PayloadAction<DriverInfo>) => {
      state.loading = false
      state.isAuthenticated = true
      state.info = action.payload
      state.isOnline = action.payload.isOnline ?? false
      state.stats = {
        trips: state.bookings.filter(b => b.status === 'accepted' || b.status === 'completed').length,
        earnings: state.bookings
          .filter(b => b.status === 'accepted' || b.status === 'completed')
          .reduce((acc, curr) => acc + curr.fare, 0),
      }
    })
    builder.addCase(verifyDriverOtp.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string || 'Failed to verify OTP'
    })

    // Signup
    builder.addCase(signupDriver.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(signupDriver.fulfilled, (state, action: PayloadAction<DriverInfo>) => {
      state.loading = false
      state.isAuthenticated = true
      state.info = action.payload
      state.stats = { trips: 0, earnings: 0 }
    })
    builder.addCase(signupDriver.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string || 'Signup failed'
    })

    // Check Session
    builder.addCase(checkDriverSession.pending, (state) => {
      state.checkingSession = true
    })
    builder.addCase(checkDriverSession.fulfilled, (state, action: PayloadAction<DriverInfo | null>) => {
      state.checkingSession = false
      if (action.payload) {
        state.isAuthenticated = true
        state.info = action.payload
        state.isOnline = action.payload.isOnline ?? false
        state.stats = {
          trips: state.bookings.filter(b => b.status === 'accepted' || b.status === 'completed').length,
          earnings: state.bookings
            .filter(b => b.status === 'accepted' || b.status === 'completed')
            .reduce((acc, curr) => acc + curr.fare, 0),
        }
      }
    })
    builder.addCase(checkDriverSession.rejected, (state) => {
      state.checkingSession = false
    })

    // Update Profile
    builder.addCase(updateDriverProfile.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updateDriverProfile.fulfilled, (state, action: PayloadAction<DriverInfo>) => {
      state.loading = false
      state.info = action.payload
    })
    builder.addCase(updateDriverProfile.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string || 'Profile update failed'
    })

    // Toggle Online Status
    builder.addCase(toggleOnlineStatus.fulfilled, (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload
      const id = 'N-' + Date.now()
      if (state.isOnline) {
        state.notifications.unshift({
          id,
          title: 'You are now Online',
          description: 'You will receive notifications of available bookings near you.',
          time: 'Just now',
          type: 'system',
          read: false,
        })
      } else {
        state.notifications.unshift({
          id,
          title: 'You are now Offline',
          description: 'Go online to start receiving booking requests.',
          time: 'Just now',
          type: 'system',
          read: false,
        })
      }
    })

    // Accept Booking
    builder.addCase(acceptBooking.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(acceptBooking.fulfilled, (state, action: PayloadAction<Booking | { bookingId: string }>) => {
      state.loading = false
      const payload = action.payload
      const bookingId = 'bookingId' in payload ? payload.bookingId : payload.id

      const bookingIndex = state.bookings.findIndex((b) => b.id === bookingId)
      if (bookingIndex !== -1) {
        if ('id' in payload) {
          state.bookings[bookingIndex] = payload
        } else {
          state.bookings[bookingIndex].status = 'accepted'
        }

        const fare = state.bookings[bookingIndex].fare
        state.stats.trips += 1
        state.stats.earnings += fare

        state.notifications.unshift({
          id: 'N-' + Date.now(),
          title: 'Booking Accepted',
          description: `You accepted trip ${bookingId}. Drive safely!`,
          time: 'Just now',
          type: 'booking',
          read: false,
        })
      }
    })
    builder.addCase(acceptBooking.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string || 'Failed to accept booking'
    })

    // Pass Booking
    builder.addCase(passBooking.fulfilled, (state, action: PayloadAction<string>) => {
      const bookingId = action.payload
      const bookingIndex = state.bookings.findIndex((b) => b.id === bookingId)
      if (bookingIndex !== -1) {
        state.bookings[bookingIndex].status = 'passed'
      }
    })

    // Mark all notifications as read
    builder.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, read: true }))
    })

    // Logout
    builder.addCase(logoutDriver.fulfilled, (state) => {
      state.isAuthenticated = false
      state.info = null
      state.isOnline = false
      state.stats = { trips: 0, earnings: 0 }
      state.bookings = []
      state.notifications = []
    })
  },
})

export const {
  setBookings,
  updateBookingState,
  setNotifications,
  updateNotificationState,
} = driverSlice.actions

export default driverSlice.reducer
