'use client'

import React from 'react'
import { Star, Search, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Booking, DriverInfo } from '@/redux/slices/driverSlice'

const getVehicleIcon = (vehicle: string) => {
  if (!vehicle) return '';
  const v = vehicle.toLowerCase();
  if (v.includes('hatchback')) return '🚗';
  if (v.includes('sedan')) return '🚙';
  if (v.includes('suv')) return '🚐';
  if (v.includes('luxury')) return '🏎️';
  return '🚗';
};

interface HomeTabProps {
  info: DriverInfo | null
  isOnline: boolean
  loading?: boolean
  handleToggleOnline: () => void
  onRefresh: () => void
  stats: { trips: number; earnings: number }
  availableBookings: Booking[]
  handleOpenDetails: (booking: Booking) => void
  onTotalTripsClick?: () => void
}

export default function HomeTab({
  info,
  isOnline,
  loading = false,
  handleToggleOnline,
  onRefresh,
  stats,
  availableBookings,
  handleOpenDetails,
  onTotalTripsClick,
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
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Good afternoon, {info?.fullName}
            <span className="animate-float">👋</span>
          </h3>
          <p className="text-sm text-text-muted flex items-center gap-1.5">
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
          <span className={cn('text-sm font-semibold tracking-wide uppercase', isOnline ? 'text-emerald-500' : 'text-text-muted')}>
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
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={onTotalTripsClick}
          className={cn(
            'bg-card border border-border/10 p-3 rounded-lg text-center shadow-xs select-none',
            onTotalTripsClick && 'cursor-pointer hover:border-gold/30 hover:bg-surface2 transition-all'
          )}
        >
          <span className="block font-bold text-xl text-gold-light">{stats.trips}</span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Total Trips</span>
        </div>
        <div className="bg-card border border-border/10 p-3 rounded-lg text-center shadow-xs">
          <span className="block font-bold text-xl text-gold-light">₹{stats.earnings}</span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Total Earnings</span>
        </div>
        {/* <div className="bg-card border border-border/10 p-3 rounded-lg text-center shadow-xs">
          <span className="block font-bold text-xl text-gold-light flex items-center justify-center gap-0.5">
            {info?.rating} <Star size={12} className="fill-gold-light text-gold-light" />
          </span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Your Rating</span>
        </div> */}
      </div>

      {/* AVAILABLE BOOKINGS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm uppercase tracking-wider text-text-muted">
              Available Bookings
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-surface2 border border-border/15 text-[10px] font-semibold text-gold-light">
              {isOnline ? availableBookings.length : 0} available
            </span>
          </div>
          {isOnline && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg border border-border/10 text-text-muted hover:text-gold-light hover:bg-surface2 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
              title="Refresh Bookings"
            >
              <RefreshCw size={14} className={cn(loading && 'animate-spin')} />
            </button>
          )}
        </div>

        {!isOnline ? (
          /* Offline State */
          <div className="bg-card/40 border border-dashed border-border/10 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 transition-all duration-300">
            <div className="h-12 w-12 rounded-full bg-surface2 border border-border/10 flex items-center justify-center text-text-muted">
              <Search size={22} className="animate-float" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-base">Go Online to See Bookings</h4>
              <p className="text-sm text-text-muted max-w-[240px] mx-auto leading-relaxed">
                Toggle online status above to start receiving booking requests in Delhi NCR.
              </p>
            </div>
          </div>
        ) : availableBookings.length === 0 ? (
          /* Online and Empty State with Search Button */
          <div className="bg-card/40 border border-border/10 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 rounded-full bg-surface2 border border-border/10 flex items-center justify-center text-text-muted">
              <Search size={22} className="text-gold-light" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-semibold text-base">No bookings found</h4>
              <p className="text-sm text-text-muted max-w-[220px] mx-auto leading-relaxed mb-2">
                Click search to scan for available booking requests in your area.
              </p>
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="px-4 py-2 bg-primary hover:bg-primary/95 text-black font-semibold text-sm rounded-lg flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Search size={14} className={cn(loading && 'hidden')} />
              {loading && <RefreshCw size={14} className="animate-spin" />}
              {loading ? 'Searching...' : 'Search Bookings'}
            </button>
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
                    <h4 className="font-bold text-base text-foreground group-hover:text-gold-light transition-colors">
                      {booking.status === 'accepted' || booking.status === 'completed'
                        ? booking.customerName
                        : 'Hidden (Accept to view)'}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {booking.vehicle && (
                      <span 
                        title={`Vehicle Category: ${booking.vehicle}`} 
                        className="text-base leading-none select-none filter drop-shadow-xs"
                      >
                        {getVehicleIcon(booking.vehicle)}
                      </span>
                    )}
                    <span
                      className={cn(
                        'text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border',
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
                </div>

                {/* Route vertical line style */}
                <div className="space-y-3.5 relative pl-4 before:content-[''] before:absolute before:left-1 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-border/25">
                  {/* Pickup */}
                  <div className="relative">
                    <span className="absolute -left-4.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
                    <p className="text-sm text-foreground font-semibold leading-none mb-1">Pickup</p>
                    <p className="text-[11px] text-text-muted truncate">{booking.pickup}</p>
                  </div>
                  {/* Drop */}
                  <div className="relative">
                    <span className="absolute -left-4.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 ring-4 ring-amber-500/10" />
                    <p className="text-sm text-foreground font-semibold leading-none mb-1">Drop</p>
                    <p className="text-[11px] text-text-muted truncate">{booking.drop}</p>
                  </div>
                </div>

                <div className="border-t border-border/10 mt-4 pt-3 flex items-center justify-between text-[11px] text-text-muted">
                  <span className="font-semibold text-sm text-foreground">
                    {booking.dateTime}
                  </span>
                  <span className="font-extrabold text-2xl text-emerald-500">
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
