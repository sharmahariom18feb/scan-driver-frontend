'use client'

import React from 'react'
import { Star, Search, RefreshCw } from 'lucide-react'
import { cn, getMonthlyDutyHours, getMonthlyDays } from '@/lib/utils'
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
  onAccept: (id: string) => Promise<void>
}

const formatTripType = (type: string) => {
  if (!type) return '';
  if (type === 'AIRPORT DROP') return 'Airport Drop';
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const getTripTitle = (booking: Booking) => {
  const isOneWay = booking.duration?.toLowerCase().includes('one way');
  if (isOneWay) {
    return booking.type === 'OUTSTATION' ? 'One Way - Outstation' : 'One Way - Incity';
  }
  return `${formatTripType(booking.type)} - Incity`;
};

const getPackageText = (booking: Booking) => {
  if (!booking.duration) {
    if (booking.distance && booking.distance !== 'N/A') {
      return `Package - ${booking.distance}`;
    }
    return 'Package - N/A';
  }
  if (booking.type === 'MONTHLY') {
    const hours = getMonthlyDutyHours(booking.duration);
    const days = getMonthlyDays(booking.duration);
    if (days && hours) {
      return `Package - ${days} • ${hours}`;
    }
    return `Package - ${booking.duration}`;
  }
  if (booking.distance && booking.distance !== 'N/A' && !booking.duration.toLowerCase().includes(booking.distance.toLowerCase())) {
    return `Package - ${booking.duration} (${booking.distance})`;
  }
  return `Package - ${booking.duration}`;
};

const formatTimeAndDate = (dateTimeStr: string) => {
  if (!dateTimeStr) return '';
  try {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // YYYY-MM-DD HH:MM
    const match = dateTimeStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
    if (match) {
      const [_, year, monthNum, dayNum, hours, minutes] = match;
      const date = new Date(Number(year), Number(monthNum) - 1, Number(dayNum));
      let hr = Number(hours);
      const ampm = hr >= 12 ? 'PM' : 'AM';
      hr = hr % 12;
      hr = hr ? hr : 12;
      const timeStr = `${hr}:${minutes} ${ampm}`;
      return `${timeStr}, ${Number(dayNum)} ${months[date.getMonth()]}`;
    }
    
    // Generic Date parser
    const d = new Date(dateTimeStr);
    if (!isNaN(d.getTime())) {
      let hr = d.getHours();
      const min = String(d.getMinutes()).padStart(2, '0');
      const ampm = hr >= 12 ? 'PM' : 'AM';
      hr = hr % 12;
      hr = hr ? hr : 12;
      const timeStr = `${hr}:${min} ${ampm}`;
      return `${timeStr}, ${d.getDate()} ${months[d.getMonth()]}`;
    }
  } catch (e) {
    console.error('Error parsing datetime:', e);
  }
  return dateTimeStr;
};

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
  onAccept,
}: HomeTabProps) {
  const [acceptingIds, setAcceptingIds] = React.useState<Record<string, boolean>>({})

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
          <div className="space-y-4">
            {availableBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => handleOpenDetails(booking)}
                className={cn(
                  'rounded-xl p-4.5 transition-all duration-300 border-2 flex flex-col gap-3.5 relative overflow-hidden cursor-pointer hover:border-gold/30',
                  booking.type === 'MONTHLY'
                    ? 'bg-emerald-800/[0.08] dark:bg-emerald-950/20 border-emerald-600/50 dark:border-emerald-500/40 shadow-lg shadow-emerald-900/20 dark:shadow-emerald-950/50'
                    : 'bg-card border-border shadow-md'
                )}
              >
                {/* Header: Date/Time on left, Car info on right */}
                <div className="flex items-center justify-between border-b border-border/10 pb-2.5">
                  <div className="font-bold text-sm text-text tracking-wide">
                    {formatTimeAndDate(booking.dateTime)}
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-text tracking-wide">
                    {booking.vehicle && (
                      <span className="text-base select-none leading-none">
                        {getVehicleIcon(booking.vehicle)}
                      </span>
                    )}
                    <span>{booking.vehicle}</span>
                  </div>
                </div>

                {/* Body: 2 Column Layout matching image structure */}
                <div className="grid grid-cols-12 gap-3 items-center">
                  {/* Left Column Box: White background with pickup details */}
                  <div className="col-span-7 bg-white dark:bg-zinc-900 border border-border/10 rounded-xl p-3.5 shadow-xs flex flex-col gap-2 min-h-[96px] justify-center">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={cn(
                        'font-black text-sm tracking-wide',
                        booking.type === 'MONTHLY' ? 'text-emerald-700 dark:text-emerald-400' : 'text-primary'
                      )}>
                        {getTripTitle(booking)}
                      </h4>
                      {booking.type === 'MONTHLY' && getMonthlyDutyHours(booking.duration) ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0 whitespace-nowrap">
                          ⏰ {getMonthlyDutyHours(booking.duration)}
                        </span>
                      ) : (
                        booking.distance && booking.distance !== 'N/A' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25 shrink-0 whitespace-nowrap">
                            {booking.distance}
                          </span>
                        )
                      )}
                    </div>
                    {/* {booking.type === 'MONTHLY' && getMonthlyDutyHours(booking.duration) && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-350 bg-emerald-500/10 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-500/20">
                        <span>⏰ Working Duty: {getMonthlyDutyHours(booking.duration)}</span>
                        {getMonthlyDays(booking.duration) && (
                          <span className="text-text-muted font-medium">• {getMonthlyDays(booking.duration)}</span>
                        )}
                      </div>
                    )} */}
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-normal line-clamp-3">
                        {booking.pickup}
                      </p>
                    </div>
                    {booking.drop && booking.drop.trim() !== '' && (
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-normal line-clamp-3">
                          {booking.drop}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Fare, Duration, Accept Button */}
                  <div className="col-span-5 flex flex-col items-center justify-center text-center gap-1.5 pl-2">
                    <div className="text-2.5xl font-black text-text tracking-tight">
                      ₹{booking.fare}
                    </div>
                    <div className="text-xs text-text-muted font-bold leading-none mb-1">
                      {getPackageText(booking)}
                    </div>
                    <button
                      disabled={acceptingIds[booking.id]}
                      onClick={async (e) => {
                        e.stopPropagation()
                        setAcceptingIds(prev => ({ ...prev, [booking.id]: true }))
                        try {
                          await onAccept(booking.id)
                        } catch (err) {
                          console.error('Accept booking error:', err)
                        } finally {
                          setAcceptingIds(prev => ({ ...prev, [booking.id]: false }))
                        }
                      }}
                      className={cn(
                        'w-full py-2.5 px-3 font-black text-xs rounded-lg shadow-sm transition-all duration-300 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed',
                        booking.type === 'MONTHLY'
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : 'bg-primary hover:bg-gold-light text-black'
                      )}
                    >
                      {acceptingIds[booking.id] ? (
                        <span className="inline-block border-2 border-current border-t-transparent rounded-full h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Accept'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
