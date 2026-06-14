export interface DriverProfile {
  experience: string
  license_status: string
  documents_available: string[]
  availability: string
  service_preference: string[]
  vehicle_specialties: string[]
  previous_platforms?: string | null
  additional_comments?: string | null
}

export interface Driver {
  id: string
  email: string
  full_name: string
  phone: string
  license_no: string
  current_area: string
  rating: number
  verified: boolean
  is_online: boolean
  role: 'ADMIN' | 'DRIVER' | 'CUSTOMER'
  created_at: string
  driver_profiles?: DriverProfile | DriverProfile[] | null
}

export interface Booking {
  id: string
  customer_name: string
  phone: string
  pickup: string
  drop: string
  date_time: string
  duration: string
  distance: string
  fare: number
  vehicle: string
  special_instructions: string | null
  status: 'available' | 'accepted' | 'passed' | 'completed'
  type: 'HOURLY' | 'WEEKLY' | 'MONTHLY' | 'OUTSTATION' | 'CORPORATE' | 'AIRPORT DROP' | 'EVENT'
  driver_id: string | null
  admin_approved: boolean
  created_at: string
  trip_status?: string | null
}

export interface DashboardStats {
  totalBookings: number
  availableBookings: number
  acceptedBookings: number
  completedBookings: number
  totalDrivers: number
  onlineDrivers: number
  pendingDriversCount: number
  pendingBookingsCount: number
}
