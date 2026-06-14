'use client'

import React, { useState } from 'react'
import { Plus, Search, Calendar, MapPin, Phone, Car, DollarSign, User, AlertCircle, X, ChevronDown, Check } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Booking, Driver } from '../types'

interface BookingsTabProps {
  bookings: Booking[]
  drivers: Driver[]
  onRefresh: () => void
}

export default function BookingsTab({ bookings, drivers, onRefresh }: BookingsTabProps) {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'accepted' | 'completed' | 'cancelled'>('all')
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'approved' | 'pending'>('all')

  // Create Booking Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [tripType, setTripType] = useState<Booking['type']>('HOURLY')
  const [vehicleClass, setVehicleClass] = useState('Sedan')
  const [vehicleModel, setVehicleModel] = useState('')
  const [durationValue, setDurationValue] = useState('8')
  const [fare, setFare] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [adminApproved, setAdminApproved] = useState(true)
  const [creating, setCreating] = useState(false)

  // Driver Assignment Modal State
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null)
  const [assigning, setAssigning] = useState(false)

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      b.vehicle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'cancelled'
        ? (b.trip_status === 'cancelled_by_driver' || b.trip_status === 'cancelled')
        : statusFilter === 'completed'
        ? (b.status === 'completed' && b.trip_status !== 'cancelled_by_driver' && b.trip_status !== 'cancelled')
        : b.status === statusFilter

    const matchesApproval =
      approvalFilter === 'all'
        ? true
        : approvalFilter === 'approved'
        ? b.admin_approved
        : !b.admin_approved

    return matchesSearch && matchesStatus && matchesApproval
  })

  // Format Helper
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      if (isNaN(date.getTime())) return timeStr
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return timeStr
    }
  }

  // Create Booking Action
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !phone || !pickup || !fare) {
      toast.error('Please fill out all required fields')
      return
    }

    setCreating(true)
    const bookingId = 'SD-' + Math.floor(1000 + Math.random() * 9000)
    const formattedDateTime = startDate && startTime ? `${startDate} ${startTime}` : 'Immediate'
    const formattedDuration = tripType === 'HOURLY' ? `${durationValue} Hours` : `${durationValue} Days`
    const vehicleString = `${vehicleClass}${vehicleModel ? ` (${vehicleModel})` : ''}`

    const payload = {
      id: bookingId,
      customer_name: customerName,
      phone: phone,
      pickup: pickup,
      drop: drop || 'Local Trip',
      date_time: formattedDateTime,
      duration: formattedDuration,
      distance: tripType === 'OUTSTATION' ? 'Estimated' : 'N/A',
      fare: Number(fare),
      vehicle: vehicleString,
      special_instructions: specialInstructions || null,
      status: 'available',
      type: tripType,
      driver_id: null,
      admin_approved: adminApproved,
    }

    try {
      const { error } = await supabase.from('bookings').insert(payload)
      if (error) throw error

      toast.success(`Booking ${bookingId} created successfully!`)
      setShowCreateModal(false)

      // If approved immediately, send push notifications to drivers
      if (adminApproved) {
        fetch('/api/notify-drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: bookingId }),
        }).catch((err) => console.error('Failed to trigger push notifications:', err))
      }

      // Reset Form
      setCustomerName('')
      setPhone('')
      setPickup('')
      setDrop('')
      setStartDate('')
      setStartTime('')
      setVehicleModel('')
      setFare('')
      setSpecialInstructions('')
      setAdminApproved(true)

      onRefresh()
    } catch (err: any) {
      console.error('Error creating booking:', err)
      toast.error(err.message || 'Failed to create booking')
    } finally {
      setCreating(false)
    }
  }

  // Assign Driver Action
  const handleAssignDriver = async (driverId: string | null) => {
    if (!assigningBooking) return
    setAssigning(true)

    try {
      // 1. Update Booking
      const { error } = await supabase
        .from('bookings')
        .update({
          driver_id: driverId,
          status: driverId ? 'accepted' : 'available',
        })
        .eq('id', assigningBooking.id)

      if (error) throw error

      // 2. If assigning, insert system notification for driver
      if (driverId) {
        const selectedDriver = drivers.find((d) => d.id === driverId)
        const driverName = selectedDriver ? `${selectedDriver.full_name}` : 'Driver'

        await supabase.from('notifications').insert({
          driver_id: driverId,
          title: 'Booking Assigned by Admin',
          description: `Admin assigned booking ${assigningBooking.id} to you. Trip: ${assigningBooking.pickup} to ${assigningBooking.drop}.`,
          time: 'Just now',
          type: 'booking',
          read: false,
        })

        toast.success(`Booking ${assigningBooking.id} assigned to ${driverName}`)
      } else {
        toast.success(`Driver unassigned. Booking ${assigningBooking.id} is now available.`)
      }

      setAssigningBooking(null)
      onRefresh()
    } catch (err: any) {
      console.error('Error assigning driver:', err)
      toast.error(err.message || 'Failed to update assignment')
    } finally {
      setAssigning(false)
    }
  }

  // Update Status Action
  const handleUpdateStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)

      if (error) throw error
      toast.success(`Booking ${bookingId} status updated to ${status}`)
      onRefresh()
    } catch (err: any) {
      console.error('Error updating status:', err)
      toast.error(err.message || 'Failed to update status')
    }
  }

  // Approve Booking Action
  const handleApproveBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ admin_approved: true })
        .eq('id', bookingId)

      if (error) throw error
      toast.success(`Booking ${bookingId} approved successfully!`)

      // Trigger push notifications
      fetch('/api/notify-drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      }).catch((err) => console.error('Failed to trigger push notifications:', err))

      onRefresh()
    } catch (err: any) {
      console.error('Error approving booking:', err)
      toast.error(err.message || 'Failed to approve booking')
    }
  }

  // Unapprove Booking Action
  const handleUnapproveBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ admin_approved: false })
        .eq('id', bookingId)

      if (error) throw error
      toast.success(`Booking ${bookingId} unapproved successfully!`)
      onRefresh()
    } catch (err: any) {
      console.error('Error unapproving booking:', err)
      toast.error(err.message || 'Failed to unapprove booking')
    }
  }

  // Delete Booking Action
  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete booking ${bookingId}?`)) {
      return
    }
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (error) throw error
      toast.success(`Booking ${bookingId} deleted successfully!`)
      onRefresh()
    } catch (err: any) {
      console.error('Error deleting booking:', err)
      toast.error(err.message || 'Failed to delete booking')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="text-slate-200 text-xs mt-1">Create, dispatch, and manage ride bookings.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer"
        >
          <Plus size={16} /> CREATE NEW BOOKING
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900 border border-slate-700/80 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-500 transition-colors"
            placeholder="Search by ID, name, phone, vehicle..."
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700 overflow-x-auto">
          {(['all', 'available', 'accepted', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-350 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Approval filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700 overflow-x-auto">
          {([
            { id: 'all', label: 'All Approval' },
            { id: 'approved', label: 'Approved Only' },
            { id: 'pending', label: 'Pending Approval' },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setApprovalFilter(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                approvalFilter === opt.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-350 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
        {/* Table for Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-[10px] uppercase font-bold tracking-widest text-slate-300">
                <th className="py-4 px-5">ID / Type</th>
                <th className="py-4 px-5">Customer</th>
                <th className="py-4 px-5">Details</th>
                <th className="py-4 px-5">Locations</th>
                <th className="py-4 px-5">Driver</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400 italic">
                    No bookings found matching filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const assignedDriver = drivers.find((d) => d.id === b.driver_id)
                  return (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition-all text-xs">
                      {/* ID / Type */}
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-extrabold text-white">{b.id}</p>
                            {!b.admin_approved && (
                              <span className="inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider">
                                PENDING
                              </span>
                            )}
                          </div>
                          <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-750 text-slate-300 uppercase tracking-wide">
                            {b.type}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-white">{b.customer_name}</p>
                          <p className="text-[10px] text-slate-300 font-semibold flex items-center gap-1">
                            <Phone size={10} className="text-slate-450" /> {b.phone}
                          </p>
                        </div>
                      </td>

                      {/* Details */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <p className="text-slate-200 font-bold">{b.vehicle}</p>
                          <p className="text-[10px] text-slate-300 font-semibold flex items-center gap-1">
                            <Calendar size={10} className="text-amber-500 shrink-0" /> {b.date_time}
                          </p>
                          <p className="text-[10px] text-slate-200 font-bold">₹{b.fare} • {b.duration}</p>
                        </div>
                      </td>

                      {/* Locations */}
                      <td className="py-4 px-5 max-w-[200px]">
                        <div className="space-y-1 font-semibold">
                          <p className="text-[10px] text-slate-200 truncate" title={b.pickup}>
                            <span className="text-emerald-400 font-bold">P:</span> {b.pickup}
                          </p>
                          <p className="text-[10px] text-slate-200 truncate" title={b.drop}>
                            <span className="text-rose-455 font-bold">D:</span> {b.drop}
                          </p>
                        </div>
                      </td>

                      {/* Driver Assignment */}
                      <td className="py-4 px-5">
                        {assignedDriver ? (
                          <div className="space-y-1">
                            <p className="font-bold text-white">{assignedDriver.full_name}</p>
                            <button
                              onClick={() => setAssigningBooking(b)}
                              className="text-[9px] font-extrabold text-amber-500 hover:text-amber-400 uppercase hover:underline cursor-pointer"
                            >
                              Change Driver
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssigningBooking(b)}
                            disabled={b.status === 'completed'}
                            className="px-2.5 py-1.5 text-[9px] font-extrabold rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors uppercase disabled:opacity-40 cursor-pointer"
                          >
                            Assign Driver
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.admin_approved ? (
                            b.status !== 'completed' && (
                              <button
                                onClick={() => handleUnapproveBooking(b.id)}
                                className="border border-slate-700 hover:bg-slate-800 text-slate-355 font-extrabold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer transition-all mr-1"
                              >
                                Unapprove
                              </button>
                            )
                          ) : (
                            <>
                              <button
                                onClick={() => handleApproveBooking(b.id)}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer transition-all mr-1 shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                className="bg-rose-500 hover:bg-rose-650 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer transition-all mr-1 shadow-sm"
                              >
                                Delete
                              </button>
                            </>
                          )}

                          <span
                            className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full mr-2 ${
                              b.trip_status === 'cancelled_by_driver' || b.trip_status === 'cancelled'
                                ? 'bg-rose-950 text-rose-300 border border-rose-850'
                                : b.status === 'completed'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : b.status === 'accepted'
                                ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {b.trip_status === 'cancelled_by_driver' || b.trip_status === 'cancelled' ? 'cancelled' : b.status}
                          </span>

                          {b.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'completed')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-[10px] py-1.5 px-2.5 rounded-lg cursor-pointer transition-all"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Cards for Mobile view */}
        <div className="block md:hidden divide-y divide-slate-800/80">
          {filteredBookings.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-400 italic">No bookings found.</p>
          ) : (
            filteredBookings.map((b) => {
              const assignedDriver = drivers.find((d) => d.id === b.driver_id)
              return (
                <div key={b.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white">{b.id}</span>
                      {!b.admin_approved && (
                        <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wide">
                          PENDING
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        b.trip_status === 'cancelled_by_driver' || b.trip_status === 'cancelled'
                          ? 'bg-rose-950 text-rose-300 border border-rose-850'
                          : b.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : b.status === 'accepted'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {b.trip_status === 'cancelled_by_driver' || b.trip_status === 'cancelled' ? 'cancelled' : b.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-200 text-xs">
                    <p className="font-extrabold text-white">{b.customer_name} • {b.phone}</p>
                    <p className="font-bold text-slate-300">{b.vehicle} ({b.type})</p>
                    <p className="text-[10px] text-slate-300 font-semibold">{b.date_time} • ₹{b.fare} ({b.duration})</p>
                    <p className="text-[10px] truncate"><span className="text-emerald-400 font-bold">Pick:</span> {b.pickup}</p>
                    <p className="text-[10px] truncate"><span className="text-rose-455 font-bold">Drop:</span> {b.drop}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-800">
                    <div className="text-xs">
                      {assignedDriver ? (
                        <p className="text-slate-200 text-[10px] font-semibold">
                          Driver: <span className="font-extrabold text-white">{assignedDriver.full_name}</span>
                        </p>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No driver assigned</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {b.admin_approved ? (
                        b.status !== 'completed' && (
                          <button
                            onClick={() => handleUnapproveBooking(b.id)}
                            className="bg-slate-855 hover:bg-slate-800 text-slate-300 border border-slate-700 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                          >
                            Unapprove
                          </button>
                        )
                      ) : (
                        <>
                          <button
                            onClick={() => handleApproveBooking(b.id)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(b.id)}
                            className="bg-rose-500 hover:bg-rose-600 text-white py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setAssigningBooking(b)}
                        className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                      >
                        {assignedDriver ? 'Change' : 'Assign'}
                      </button>
                      {b.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'completed')}
                          className="bg-emerald-500 text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Modal: Create Booking */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Create New Booking</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form onSubmit={handleCreateBooking} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Aman Gupta"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. +91 9898989898"
                  />
                </div>

                {/* Trip Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trip Type</label>
                  <select
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value as Booking['type'])}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="HOURLY">Hourly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="OUTSTATION">Outstation</option>
                  </select>
                </div>

                {/* Vehicle Class */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vehicle Category</label>
                  <select
                    value={vehicleClass}
                    onChange={(e) => setVehicleClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>

                {/* Vehicle Model */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vehicle Model (Optional)</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Swift, Ciaz, Fortuner"
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  />
                </div>

                {/* Start Time */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Duration ({tripType === 'HOURLY' ? 'Hours' : 'Days'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={durationValue}
                    onChange={(e) => setDurationValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  />
                </div>

                {/* Fare */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fare Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={fare}
                    onChange={(e) => setFare(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. 950"
                  />
                </div>

                {/* Admin Approved Checkbox */}
                <div className="flex items-center gap-2.5 sm:col-span-2 py-1.5">
                  <input
                    type="checkbox"
                    id="adminApproved"
                    checked={adminApproved}
                    onChange={(e) => setAdminApproved(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-800 text-amber-500 bg-slate-950 focus:ring-amber-500/20 cursor-pointer"
                  />
                  <label htmlFor="adminApproved" className="text-xs font-bold text-slate-350 hover:text-white cursor-pointer select-none">
                    Approve immediately (make visible to all drivers)
                  </label>
                </div>
              </div>

              {/* Pickup Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pickup Address *</label>
                <textarea
                  required
                  rows={2}
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="Enter complete pickup location"
                />
              </div>

              {/* Drop Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Destination Address (Optional)</label>
                <textarea
                  rows={2}
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="Enter destination (required for Outstation)"
                />
              </div>

              {/* Special Instructions */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Special Instructions / Admin Notes</label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="Notes for driver, payment details, etc."
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-850 hover:bg-slate-850 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'CREATING…' : 'CREATE BOOKING'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Driver Assignment */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col relative animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-sm">Assign Driver</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Select a driver for Booking {assigningBooking.id}</p>
              </div>
              <button
                onClick={() => setAssigningBooking(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body (Scrollable Driver List) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Unassign Driver Button */}
              {assigningBooking.driver_id && (
                <button
                  onClick={() => handleAssignDriver(null)}
                  disabled={assigning}
                  className="w-full py-2.5 px-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-slate-950 font-bold text-xs rounded-xl transition-all text-center cursor-pointer mb-2 disabled:opacity-50"
                >
                  UNASSIGN CURRENT DRIVER
                </button>
              )}

              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Available & Verified Drivers</p>
              
              {drivers.filter((d) => d.verified).length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center italic">No verified drivers onboarded yet.</p>
              ) : (
                drivers
                  .filter((d) => d.verified)
                  .map((driver) => {
                    const isSelected = assigningBooking.driver_id === driver.id
                    return (
                      <button
                        key={driver.id}
                        onClick={() => handleAssignDriver(driver.id)}
                        disabled={assigning}
                        className={`w-full p-3.5 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer disabled:opacity-50 ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-white'
                            : 'bg-slate-950/60 border-slate-850 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            {driver.full_name}
                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${driver.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold">{driver.phone} • {driver.current_area}</p>
                          <p className="text-[9px] text-slate-400">Rating: {driver.rating}★</p>
                        </div>
                        {isSelected && <Check size={16} className="text-amber-500" />}
                      </button>
                    )
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
