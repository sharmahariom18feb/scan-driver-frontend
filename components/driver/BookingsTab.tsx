'use client'

import React from 'react'
import { Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Booking } from '@/redux/slices/driverSlice'

interface BookingsTabProps {
  availableBookings: Booking[]
  myTrips: Booking[]
  bookingFilter: 'available' | 'trips'
  setBookingFilter: (val: 'available' | 'trips') => void
  handleOpenDetails: (booking: Booking) => void
}

export default function BookingsTab({
  availableBookings,
  myTrips,
  bookingFilter,
  setBookingFilter,
  handleOpenDetails,
}: BookingsTabProps) {
  return (
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
                        ? 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                        : booking.type === 'OUTSTATION'
                          ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
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
                onClick={() => handleOpenDetails(booking)}
                className={cn(
                  'bg-card border rounded-xl p-4 shadow-sm relative overflow-hidden cursor-pointer hover:border-gold/30 transition-all duration-300',
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
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
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
                    <a href={`tel:${booking.phone}`} className="font-semibold text-gold-light hover:underline" onClick={(e) => e.stopPropagation()}>
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
        )
      )}
    </div>
  )
}
