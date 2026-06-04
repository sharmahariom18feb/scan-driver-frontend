'use client'

import React from 'react'
import { Star, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Booking, DriverInfo } from '@/redux/slices/driverSlice'

interface HomeTabProps {
  info: DriverInfo | null
  isOnline: boolean
  handleToggleOnline: () => void
  stats: { trips: number; earnings: number }
  availableBookings: Booking[]
  handleOpenDetails: (booking: Booking) => void
}

export default function HomeTab({
  info,
  isOnline,
  handleToggleOnline,
  stats,
  availableBookings,
  handleOpenDetails,
}: HomeTabProps) {
  return (
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
                        ? 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                        : booking.type === 'OUTSTATION'
                          ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
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
        )}
      </div>
    </div>
  )
}
