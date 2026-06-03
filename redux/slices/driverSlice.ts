import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

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
  firstName: string
  lastName: string
  phone: string
  email: string
  currentArea: string
  licenseNo: string
  rating: number
  verified: boolean
  avatar: string
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
}

const mockBookings: Booking[] = [
  {
    id: 'SD-2841',
    customerName: 'Ankit Sharma',
    phone: '+91-9812345678',
    pickup: 'Sector 29, Gurgaon',
    drop: 'IGI Airport T3, Delhi',
    dateTime: 'Today - 06:30 AM',
    duration: '~90 min',
    distance: '38 km',
    fare: 680,
    vehicle: 'Honda City - HR26-AB1234',
    specialInstructions: 'Early morning flight. Punctuality critical.',
    status: 'available',
    type: 'AIRPORT DROP',
  },
  {
    id: 'SD-2840',
    customerName: 'Priya Mehta',
    phone: '+91-9988776655',
    pickup: 'DLF Phase 2, Gurgaon',
    drop: 'Connaught Place, Delhi',
    dateTime: 'Today - 09:00 AM',
    duration: '3 hours',
    distance: '28 km',
    fare: 447,
    vehicle: 'Maruti Swift - DL3C-XY5678',
    specialInstructions: 'Client waiting. Friendly demeanor requested.',
    status: 'available',
    type: 'HOURLY',
  },
  {
    id: 'SD-2839',
    customerName: 'Rajiv Gupta',
    phone: '+91-9765432109',
    pickup: 'Noida Sector 62',
    drop: 'Connaught Place, Delhi',
    dateTime: 'Today - 11:30 AM',
    duration: '2 hours',
    distance: '25 km',
    fare: 350,
    vehicle: 'Hyundai Creta - UP16-CD9012',
    specialInstructions: 'Keep AC on high.',
    status: 'available',
    type: 'HOURLY',
  },
  {
    id: 'SD-2838',
    customerName: 'Vikram Singh',
    phone: '+91-9543210987',
    pickup: 'Dwarka Sec 10',
    drop: 'Sector 62 Noida',
    dateTime: 'Tomorrow - 08:00 AM',
    duration: '~75 min',
    distance: '45 km',
    fare: 580,
    vehicle: 'Mahindra XUV700 - DL9C-ZA4321',
    specialInstructions: 'Driver must know automatic transmission well.',
    status: 'available',
    type: 'OUTSTATION',
  },
]

const mockNotifications: DriverNotification[] = [
  {
    id: 'N-1',
    title: 'New Booking Available',
    description: 'Airport drop from Gurgaon to IGI T3 – ₹680 fare. Open now to accept.',
    time: '2 min ago',
    type: 'booking',
    read: false,
  },
  {
    id: 'N-2',
    title: 'New Booking Available',
    description: 'Hourly booking from DLF Phase 2 – 3 hours, ₹447. Client waiting.',
    time: '6 min ago',
    type: 'booking',
    read: false,
  },
  {
    id: 'N-3',
    title: 'Profile Verified',
    description: 'Your Aadhaar and license verification is complete. You can now receive bookings.',
    time: '1 hour ago',
    type: 'system',
    read: false,
  },
  {
    id: 'N-4',
    title: 'Rating Update',
    description: 'You received a 5-star rating from your last trip. Keep it up!',
    time: '3 hours ago',
    type: 'rating',
    read: true,
  },
  {
    id: 'N-5',
    title: 'Payout Processed',
    description: 'Your weekly payout of ₹8,460 has been sent to your registered UPI ID.',
    time: 'Yesterday',
    type: 'payout',
    read: true,
  },
]

const defaultDriver: DriverInfo = {
  firstName: 'Ramesh',
  lastName: 'Kumar',
  phone: '+91-9876543210',
  email: 'ramesh@email.com',
  currentArea: 'Dwarka, Delhi',
  licenseNo: 'DL-1420210089567',
  rating: 4.8,
  verified: true,
  avatar: 'RK',
}

const initialState: DriverState = {
  isAuthenticated: false,
  isOnline: false,
  info: null,
  bookings: mockBookings,
  notifications: mockNotifications,
  stats: {
    trips: 0,
    earnings: 0,
  },
  loading: false,
  error: null,
}

// Mock Thunks - designed to easily integrate with Supabase in future
export const loginDriver = createAsyncThunk(
  'driver/login',
  async (credentials: { email: string; phone?: string }, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      // Simply log in with default driver info, using signed in email if provided
      const driverInfo = {
        ...defaultDriver,
        email: credentials.email || defaultDriver.email,
        phone: credentials.phone || defaultDriver.phone,
      }
      
      // Store in localStorage for basic persistence
      localStorage.setItem('driver_session', JSON.stringify(driverInfo))
      return driverInfo
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed')
    }
  }
)

export const signupDriver = createAsyncThunk(
  'driver/signup',
  async (profileData: Partial<DriverInfo>, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      const newDriver: DriverInfo = {
        firstName: profileData.firstName || 'New',
        lastName: profileData.lastName || 'Driver',
        phone: profileData.phone || '+91-0000000000',
        email: profileData.email || 'partner@scandriver.in',
        currentArea: profileData.currentArea || 'Delhi NCR',
        licenseNo: profileData.licenseNo || 'DL-XXXXXXXXXXXXX',
        rating: 5.0,
        verified: false, // newly registered starts unverified
        avatar: (profileData.firstName?.[0] || 'N') + (profileData.lastName?.[0] || 'D'),
      }
      
      localStorage.setItem('driver_session', JSON.stringify(newDriver))
      return newDriver
    } catch (err: any) {
      return rejectWithValue(err.message || 'Signup failed')
    }
  }
)

export const checkDriverSession = createAsyncThunk(
  'driver/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const session = localStorage.getItem('driver_session')
      if (session) {
        return JSON.parse(session) as DriverInfo
      }
      return null
    } catch (err) {
      return null
    }
  }
)

export const updateDriverProfile = createAsyncThunk(
  'driver/updateProfile',
  async (updatedData: Partial<DriverInfo>, { getState, rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      const state = getState() as { driver: DriverState }
      if (!state.driver.info) throw new Error('Not authenticated')
      
      const updatedInfo = {
        ...state.driver.info,
        ...updatedData,
      }
      
      localStorage.setItem('driver_session', JSON.stringify(updatedInfo))
      return updatedInfo
    } catch (err: any) {
      return rejectWithValue(err.message || 'Update profile failed')
    }
  }
)

export const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    toggleOnlineStatus: (state) => {
      state.isOnline = !state.isOnline
      
      // Add a notification when going online/offline
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
    },
    acceptBooking: (state, action: PayloadAction<string>) => {
      const bookingId = action.payload
      const bookingIndex = state.bookings.findIndex((b) => b.id === bookingId)
      if (bookingIndex !== -1) {
        const booking = state.bookings[bookingIndex]
        booking.status = 'accepted'
        
        // Update stats
        state.stats.trips += 1
        state.stats.earnings += booking.fare
        
        // Add notification
        state.notifications.unshift({
          id: 'N-' + Date.now(),
          title: 'Booking Accepted',
          description: `You accepted trip ${booking.id} to ${booking.drop}. Drive safely!`,
          time: 'Just now',
          type: 'booking',
          read: false,
        })
      }
    },
    passBooking: (state, action: PayloadAction<string>) => {
      const bookingId = action.payload
      const bookingIndex = state.bookings.findIndex((b) => b.id === bookingId)
      if (bookingIndex !== -1) {
        state.bookings[bookingIndex].status = 'passed'
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, read: true }))
    },
    logoutDriver: (state) => {
      localStorage.removeItem('driver_session')
      state.isAuthenticated = false
      state.info = null
      state.isOnline = false
      state.stats = { trips: 0, earnings: 0 }
      state.bookings = mockBookings.map(b => ({ ...b, status: 'available' })) // reset statuses
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginDriver.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(loginDriver.fulfilled, (state, action: PayloadAction<DriverInfo>) => {
      state.loading = false
      state.isAuthenticated = true
      state.info = action.payload
      // Setup initial stats if there are any
      state.stats = {
        trips: 0,
        earnings: 0,
      }
    })
    builder.addCase(loginDriver.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string || 'Login failed'
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
    builder.addCase(checkDriverSession.fulfilled, (state, action: PayloadAction<DriverInfo | null>) => {
      if (action.payload) {
        state.isAuthenticated = true
        state.info = action.payload
      }
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
  },
})

export const {
  toggleOnlineStatus,
  acceptBooking,
  passBooking,
  markAllNotificationsAsRead,
  logoutDriver,
} = driverSlice.actions

export default driverSlice.reducer
