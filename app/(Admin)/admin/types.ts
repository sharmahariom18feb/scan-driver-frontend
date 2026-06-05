export interface Driver {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  license_no: string
  current_area: string
  rating: number
  verified: boolean
  is_online: boolean
  role: 'ADMIN' | 'DRIVER' | 'CUSTOMER'
  created_at: string
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
