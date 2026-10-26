'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Sparkles,
  Plus,
  Search,
  Calendar,
  MapPin,
  Phone,
  Car,
  Clock,
  Trash2,
  Bell,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Shuffle,
  Send,
  Radio,
  Zap,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Booking, Driver } from '../types'
import { renderBookingTypeBadge } from './BookingsTab'
import { formatBookingDateTime } from '@/lib/utils'

interface FakeBookingsTabProps {
  onRefresh?: () => void
}

// Preset fake booking templates for quick deployment
const QUICK_PRESETS = [
  {
    name: 'IGI Airport T3 to Noida',
    customerName: 'Rohit Khanna',
    phone: '9810234567',
    pickup: 'Terminal 3, IGI Airport, New Delhi',
    drop: 'Sector 62, Noida, Uttar Pradesh',
    tripType: 'AIRPORT DROP' as const,
    vehicle: 'Sedan (Dzire / Etios)',
    duration: '1 hr 20 mins',
    distance: '38 km',
    fare: 850,
    specialInstructions: 'Flight arrived, waiting at Pillar 14 with 2 suitcases.',
    badge: 'Popular',
  },
  {
    name: 'Gurgaon to Connaught Place',
    customerName: 'Priya Sharma',
    phone: '9871654321',
    pickup: 'Cyber City, Phase 2, Gurugram',
    drop: 'Connaught Place, Inner Circle, New Delhi',
    tripType: 'HOURLY' as const,
    vehicle: 'Sedan (Honda City)',
    duration: '8 Hours',
    distance: 'N/A',
    fare: 700,
    specialInstructions: 'Local business duty. Need clean AC car and punctual driver.',
    badge: 'Hourly',
  },
  {
    name: 'Delhi to Agra Outstation',
    customerName: 'Vikram Malhotra',
    phone: '9910987654',
    pickup: 'Defence Colony, South Delhi',
    drop: 'Taj East Gate Road, Agra, UP',
    tripType: 'OUTSTATION' as const,
    vehicle: 'SUV (Ertiga / Carens)',
    duration: '1 Day',
    distance: '215 km',
    fare: 3600,
    specialInstructions: 'Same day return trip via Yamuna Expressway. Tolls included.',
    badge: 'High Value',
  },
  {
    name: 'Vasant Kunj to Cyber Hub',
    customerName: 'Amit Verma',
    phone: '9818812345',
    pickup: 'Ambience Mall, Vasant Kunj, New Delhi',
    drop: 'DLF Cyber Hub, Gurugram',
    tripType: 'HOURLY' as const,
    vehicle: 'Sedan (Swift Dzire)',
    duration: '4 Hours',
    distance: '18 km',
    fare: 550,
    specialInstructions: 'Client meeting. Urgent booking.',
    badge: 'Fast Trip',
  },
]

const RANDOM_NAMES = [
  'Rahul Sharma', 'Ananya Gupta', 'Vikram Singh', 'Deepak Verma',
  'Pooja Mehra', 'Sanjay Kapoor', 'Neha Bansal', 'Arun Joshi',
  'Kavita Nair', 'Manish Agarwal', 'Swati Saxena', 'Rohan Bhatia'
]

const RANDOM_PICKUPS = [
  'Terminal 3, IGI Airport, New Delhi',
  'Cyber Hub, DLF Phase 2, Gurugram',
  'Select Citywalk, Saket, New Delhi',
  'Sector 18 Atta Market, Noida',
  'Connaught Place Block B, New Delhi',
  'Aerocity Hospitality District, New Delhi',
  'Golf Course Road, Sector 54, Gurugram',
  'Khan Market, Rabindra Nagar, New Delhi'
]

const RANDOM_DROPS = [
  'Sector 62, Electronic City, Noida',
  'Taj Mahal East Gate, Agra',
  'DLF Phase 5, Club Drive, Gurugram',
  'Vasant Vihar Block C, New Delhi',
  'Sector 137, Expressway, Noida',
  'Nehru Place Metro Station, New Delhi',
  'Indirapuram Habitat Centre, Ghaziabad',
  'Cyber Park, Sector 67, Gurugram'
]

export default function FakeBookingsTab({ onRefresh }: FakeBookingsTabProps) {
  const [fakeBookings, setFakeBookings] = useState<Booking[]>([])
  const [driversMap, setDriversMap] = useState<Record<string, Driver>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'attempted'>('all')

  // Create Modal State
  const [showModal, setShowModal] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [tripType, setTripType] = useState<Booking['type']>('HOURLY')
  const [vehicleClass, setVehicleClass] = useState('Sedan')
  const [vehicleModel, setVehicleModel] = useState('')
  const [durationValue, setDurationValue] = useState('8')
  const [fare, setFare] = useState('650')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [notifyDriversOnCreate, setNotifyDriversOnCreate] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Action Loading States
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchFakeBookings()
    fetchDrivers()
  }, [])

  // Lock body scroll on modal open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowModal(false)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = 'auto'
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [showModal])

  // Real-time listener for fake bookings updates
  useEffect(() => {
    const channel = supabase
      .channel('fake-bookings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: 'is_fake=eq.true' },
        () => {
          fetchFakeBookings(false)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchDrivers = async () => {
    try {
      const { data } = await supabase.from('users').select('id, full_name, phone, role').eq('role', 'DRIVER')
      if (data) {
        const map: Record<string, Driver> = {}
        data.forEach((d: any) => {
          map[d.id] = d as Driver
        })
        setDriversMap(map)
      }
    } catch (err) {
      console.error('Error fetching drivers map:', err)
    }
  }

  const fetchFakeBookings = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('is_fake', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFakeBookings((data || []) as Booking[])
    } catch (err: any) {
      console.error('Error fetching fake bookings:', err)
      toast.error('Failed to load fake bookings.')
    } finally {
      if (showLoadingSpinner) setLoading(false)
    }
  }

  // Pre-fill modal with random realistic data
  const handleRandomize = () => {
    const randName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]
    const randPhone = '98' + Math.floor(10000000 + Math.random() * 90000000)
    const randPickup = RANDOM_PICKUPS[Math.floor(Math.random() * RANDOM_PICKUPS.length)]
    const randDrop = RANDOM_DROPS[Math.floor(Math.random() * RANDOM_DROPS.length)]
    setCustomerName(randName)
    setPhone(randPhone)
    setPickup(randPickup)
    setDrop(randDrop)
    setSpecialInstructions('Urgent pickup required. AC preferred.')
  }

  const handleOpenCreateModal = () => {
    handleRandomize()
    setTripType('HOURLY')
    setVehicleClass('Sedan')
    setVehicleModel('Dzire / Etios')
    setDurationValue('8')
    setFare('650')
    setNotifyDriversOnCreate(true)
    setShowModal(true)
  }

  // Broadcast push notifications helper
  const broadcastPushNotification = async (bookingId: string) => {
    try {
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token

      const response = await fetch('/api/notify-drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ booking_id: bookingId }),
      })

      if (!response.ok) {
        console.warn('Failed to broadcast push notification to drivers')
      } else {
        const data = await response.json()
        toast.info(`Push notifications sent to ${data.sentCount || 0} online drivers!`)
      }
    } catch (err) {
      console.error('Error broadcasting push notification:', err)
    }
  }

  // Deploy an instant preset fake booking
  const handleDeployPreset = async (preset: typeof QUICK_PRESETS[0]) => {
    const bookingId = 'SD-' + Math.floor(1000 + Math.random() * 9000)
    const payload = {
      id: bookingId,
      customer_name: preset.customerName,
      phone: preset.phone,
      pickup: preset.pickup,
      drop: preset.drop,
      date_time: 'Immediate',
      duration: preset.duration,
      distance: preset.distance,
      fare: preset.fare,
      vehicle: preset.vehicle,
      special_instructions: preset.specialInstructions,
      status: 'available',
      type: preset.tripType,
      driver_id: null,
      admin_approved: true,
      is_fake: true,
    }

    try {
      const { error } = await supabase.from('bookings').insert(payload)
      if (error) throw error

      toast.success(`Fake booking #${bookingId} deployed live on Driver App!`)
      fetchFakeBookings(false)
      onRefresh?.()

      // Broadcast push notification
      broadcastPushNotification(bookingId)
    } catch (err: any) {
      console.error('Error deploying preset fake booking:', err)
      toast.error('Failed to deploy preset: ' + err.message)
    }
  }

  // Create custom fake booking submit
  const handleCreateFakeBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !phone || !pickup || !fare) {
      toast.error('Please fill out all required fields')
      return
    }

    setSubmitting(true)
    const bookingId = 'SD-' + Math.floor(1000 + Math.random() * 9000)
    const vehicleString = `${vehicleClass}${vehicleModel ? ` (${vehicleModel})` : ''}`
    const formattedDuration = tripType === 'HOURLY' ? `${durationValue} Hours` : `${durationValue} Days`

    const payload = {
      id: bookingId,
      customer_name: customerName,
      phone: phone,
      pickup: pickup,
      drop: drop || 'Local Destination',
      date_time: 'Immediate',
      duration: formattedDuration,
      distance: tripType === 'OUTSTATION' ? 'Estimated' : 'N/A',
      fare: Number(fare),
      vehicle: vehicleString,
      special_instructions: specialInstructions || null,
      status: 'available',
      type: tripType,
      driver_id: null,
      admin_approved: true,
      is_fake: true,
    }

    try {
      const { error } = await supabase.from('bookings').insert(payload)
      if (error) throw error

      toast.success(`Fake booking #${bookingId} published live to Driver App!`)
      setShowModal(false)
      fetchFakeBookings(false)
      onRefresh?.()

      if (notifyDriversOnCreate) {
        broadcastPushNotification(bookingId)
      }
    } catch (err: any) {
      console.error('Error creating fake booking:', err)
      toast.error('Failed to create fake booking: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Re-activate an attempted/passed fake booking back to 'available'
  const handleReactivate = async (booking: Booking) => {
    setActionLoadingId(booking.id)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'available',
          admin_approved: true,
          attempted_by_driver_id: null,
          attempted_at: null,
        })
        .eq('id', booking.id)

      if (error) throw error
      toast.success(`Booking #${booking.id} re-activated! Now visible on driver app again.`)
      fetchFakeBookings(false)
      onRefresh?.()
    } catch (err: any) {
      console.error('Error re-activating booking:', err)
      toast.error('Failed to re-activate: ' + err.message)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Delete fake booking
  const handleDelete = async (bookingId: string) => {
    if (!window.confirm(`Are you sure you want to delete fake booking #${bookingId}?`)) return
    setActionLoadingId(bookingId)
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId)
      if (error) throw error
      toast.success(`Fake booking #${bookingId} deleted.`)
      fetchFakeBookings(false)
      onRefresh?.()
    } catch (err: any) {
      console.error('Error deleting fake booking:', err)
      toast.error('Failed to delete: ' + err.message)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Filtered fake bookings
  const filteredBookings = fakeBookings.filter((b) => {
    const isAttempted = b.status === 'passed' || Boolean(b.attempted_by_driver_id)
    const isLive = b.status === 'available'

    if (statusFilter === 'available' && !isLive) return false
    if (statusFilter === 'attempted' && !isAttempted) return false

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const matchId = b.id.toLowerCase().includes(q)
      const matchName = b.customer_name.toLowerCase().includes(q)
      const matchPickup = b.pickup.toLowerCase().includes(q)
      const matchDrop = b.drop.toLowerCase().includes(q)
      const matchDriver = b.attempted_by_driver_id && driversMap[b.attempted_by_driver_id]?.full_name?.toLowerCase().includes(q)
      return matchId || matchName || matchPickup || matchDrop || matchDriver
    }

    return true
  })

  // Summary counts
  const liveCount = fakeBookings.filter((b) => b.status === 'available').length
  const attemptedCount = fakeBookings.filter((b) => b.status === 'passed' || Boolean(b.attempted_by_driver_id)).length
  const totalCount = fakeBookings.length

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/10">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Fake Bookings Section
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  Driver Engagement
                </span>
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Simulate realistic ride requests on the Driver App. When any driver accepts, they receive:{' '}
                <span className="text-amber-300 font-semibold italic">"You are late, already assigned to another driver."</span> and the ride disappears.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchFakeBookings(true)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-amber-400' : ''} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            Create Fake Booking
          </button>
        </div>
      </div>

      {/* QUICK PRESETS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap size={14} className="text-amber-400" />
            1-Click Instant Presets
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Click any card to instantly publish to driver app
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_PRESETS.map((preset, idx) => (
            <div
              key={idx}
              className="group relative bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 hover:border-amber-500/40 rounded-xl p-3.5 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md hover:shadow-amber-500/5"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                    {preset.badge}
                  </span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    ₹{preset.fare}
                  </span>
                </div>

                <div className="mt-2.5 space-y-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    📍 {preset.pickup.split(',')[0]}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    🏁 {preset.drop.split(',')[0]}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  {preset.tripType} • {preset.vehicle.split(' ')[0]}
                </span>
                <button
                  onClick={() => handleDeployPreset(preset)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-[10px] uppercase tracking-wider border border-amber-500/30 hover:border-amber-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Send size={11} />
                  Deploy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* METRIC STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active on Driver App
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-2">
              {liveCount}
              {liveCount > 0 && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Visible to online drivers right now</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Radio size={20} className={liveCount > 0 ? 'animate-pulse' : ''} />
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Driver Attempted ("Late Alert")
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1">{attemptedCount}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Drivers clicked accept & got error</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Fake Bookings
            </span>
            <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Zero impact on real customer orders</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-300 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, customer, route, or driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all' as const, label: 'All Fake' },
            { id: 'available' as const, label: `Live on App (${liveCount})` },
            { id: 'attempted' as const, label: `Attempted (${attemptedCount})` },
          ].map((tab) => {
            const isActive = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* TABLE / LIST OF FAKE BOOKINGS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading Fake Bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Sparkles size={24} />
            </div>
            <h3 className="text-sm font-bold text-white">No Fake Bookings Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
              Deploy one of the quick presets above or click "Create Fake Booking" to test driver engagement!
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              + Create First Fake Booking
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Booking Info</th>
                  <th className="py-3 px-4">Route (Pickup & Drop)</th>
                  <th className="py-3 px-4">Trip & Vehicle</th>
                  <th className="py-3 px-4">Status & Driver Reaction</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-normal">
                {filteredBookings.map((b) => {
                  const isLive = b.status === 'available'
                  const isAttempted = b.status === 'passed' || Boolean(b.attempted_by_driver_id)
                  const driverWhoAttempted = b.attempted_by_driver_id ? driversMap[b.attempted_by_driver_id] : null
                  const isLoadingThis = actionLoadingId === b.id

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Booking Info */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            #{b.id}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                            FAKE
                          </span>
                        </div>
                        <div className="mt-1 text-xs font-semibold text-white">
                          {b.customer_name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone size={10} className="text-slate-500" />
                          {b.phone}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {formatBookingDateTime(b.date_time)}
                        </div>
                      </td>

                      {/* Route Details */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-start gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 mt-1 ring-2 ring-emerald-500/20" />
                            <p className="text-white font-medium line-clamp-2 leading-tight">
                              {b.pickup}
                            </p>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-rose-400 shrink-0 mt-1 ring-2 ring-rose-500/20" />
                            <p className="text-slate-400 font-medium line-clamp-2 leading-tight">
                              {b.drop}
                            </p>
                          </div>
                        </div>
                        {b.special_instructions && (
                          <p className="text-[10px] text-amber-400/80 italic mt-1 line-clamp-1">
                            "{b.special_instructions}"
                          </p>
                        )}
                      </td>

                      {/* Trip & Fare */}
                      <td className="py-3.5 px-4 align-top">
                        <div>
                          {renderBookingTypeBadge(b.type, b.duration)}
                        </div>
                        <div className="text-sm font-extrabold text-emerald-400 mt-1.5">
                          ₹{b.fare}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Car size={11} className="text-slate-500" />
                          {b.vehicle}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {b.duration} {b.distance && b.distance !== 'N/A' ? `• ${b.distance}` : ''}
                        </div>
                      </td>

                      {/* Status & Reaction */}
                      <td className="py-3.5 px-4 align-top">
                        {isLive ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            Live on Driver App
                          </div>
                        ) : isAttempted ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle2 size={12} />
                              Attempted & Removed
                            </div>
                            {driverWhoAttempted ? (
                              <div className="text-[11px] text-slate-300 font-medium mt-1">
                                <span className="text-slate-400">Driver:</span> {driverWhoAttempted.full_name} ({driverWhoAttempted.phone})
                              </div>
                            ) : b.attempted_by_driver_id ? (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Driver ID: {b.attempted_by_driver_id.slice(0, 8)}...
                              </div>
                            ) : null}
                            {b.attempted_at && (
                              <div className="text-[10px] text-slate-500">
                                At: {new Date(b.attempted_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                            <div className="text-[10px] text-emerald-400 font-semibold italic">
                              Driver saw: "You are late, already assigned to another driver."
                            </div>
                          </div>
                        ) : (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {b.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Notify Online Drivers */}
                          <button
                            onClick={() => broadcastPushNotification(b.id)}
                            disabled={isLoadingThis}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 transition-all cursor-pointer shadow-xs"
                            title="Send Push Notification to Online Drivers"
                          >
                            <Bell size={14} />
                          </button>

                          {/* Re-activate if expired/attempted */}
                          {!isLive && (
                            <button
                              onClick={() => handleReactivate(b)}
                              disabled={isLoadingThis}
                              className="px-2 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-[10px] uppercase tracking-wide border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
                              title="Make this fake booking available again"
                            >
                              <RefreshCw size={11} className={isLoadingThis ? 'animate-spin' : ''} />
                              Re-live
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(b.id)}
                            disabled={isLoadingThis}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition-all cursor-pointer shadow-xs"
                            title="Delete Fake Booking"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE CUSTOM FAKE BOOKING MODAL */}
      {showModal && mounted &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => !submitting && setShowModal(false)} />

            <div className="relative my-auto w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Create Fake / Simulated Booking</h3>
                    <p className="text-[11px] text-slate-400">Shows live on Driver App. Returns "You are late..." on accept.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 rounded-lg transition-all cursor-pointer"
                    title="Fill random realistic values"
                  >
                    <Shuffle size={12} />
                    Randomize
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateFakeBooking} className="p-5 space-y-4">
                {/* Trip Type & Vehicle Class */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Trip Type
                    </label>
                    <select
                      value={tripType}
                      onChange={(e) => setTripType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="HOURLY">Hourly Duty</option>
                      <option value="AIRPORT DROP">Airport Drop</option>
                      <option value="OUTSTATION">Outstation Trip</option>
                      <option value="ONE WAY">One Way</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="CORPORATE">Corporate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Vehicle Class
                    </label>
                    <select
                      value={vehicleClass}
                      onChange={(e) => setVehicleClass(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Sedan">Sedan (Dzire / Etios)</option>
                      <option value="SUV">SUV (Carens / Ertiga)</option>
                      <option value="Innova">Innova Crysta</option>
                      <option value="Hatchback">Hatchback (WagonR / i10)</option>
                      <option value="Luxury">Luxury (BMW / Mercedes)</option>
                    </select>
                  </div>
                </div>

                {/* Customer Name & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9810123456"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Pickup Location */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Pickup Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="e.g. Terminal 3, IGI Airport, New Delhi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Drop Location */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Drop Location
                  </label>
                  <input
                    type="text"
                    value={drop}
                    onChange={(e) => setDrop(e.target.value)}
                    placeholder="e.g. Sector 62, Noida (or leave for Local)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Fare & Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Driver Fare (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={fare}
                      onChange={(e) => setFare(e.target.value)}
                      placeholder="e.g. 650"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-emerald-400 font-bold placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Duration / Duty Time
                    </label>
                    <input
                      type="text"
                      value={durationValue}
                      onChange={(e) => setDurationValue(e.target.value)}
                      placeholder="e.g. 8 Hours or 1 Day"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. AC car required, client meeting, immediate departure"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Push Notification Switch */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <input
                    id="pushNotifyCheck"
                    type="checkbox"
                    checked={notifyDriversOnCreate}
                    onChange={(e) => setNotifyDriversOnCreate(e.target.checked)}
                    className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="pushNotifyCheck" className="text-xs text-slate-300 cursor-pointer select-none">
                    <span className="font-bold text-white block">Broadcast Push Notification Immediately</span>
                    <span className="text-[11px] text-slate-400">
                      Send Firebase push alert & sound to all online drivers right now.
                    </span>
                  </label>
                </div>

                {/* Notice Alert */}
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px]">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>
                    This booking is flagged with <code>is_fake = true</code>. It will not alter real revenue, completed trips, or admin notification SMS.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                    className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Publish to Driver App
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
