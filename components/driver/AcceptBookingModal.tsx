'use client'

import React from 'react'
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Check,
  X,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Booking } from '@/redux/slices/driverSlice'

interface AcceptBookingModalProps {
  isOpen: boolean
  booking: Booking | null
  isLoading?: boolean
  onClose: () => void
  onConfirm: (bookingId: string) => Promise<void>
}

const parseAddress = (address: string) => {
  if (!address) return ''
  const gpsRegex = /\(GPS:\s*(https?:\/\/[^\s\)]+)\)/i
  return address.replace(gpsRegex, '').trim()
}

export default function AcceptBookingModal({
  isOpen,
  booking,
  isLoading = false,
  onClose,
  onConfirm,
}: AcceptBookingModalProps) {
  if (!isOpen || !booking) return null

  const pickupText = parseAddress(booking.pickup)
  const dropText = parseAddress(booking.drop)

  return (
    <div className="fixed sm:absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div
        className="absolute inset-0"
        onClick={() => {
          if (!isLoading) onClose()
        }}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-card border border-border/20 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 z-10 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-foreground hover:bg-surface2 rounded-full transition-all duration-200 cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}

        {/* Header Icon & Question */}
        <div className="flex flex-col items-center text-center pt-1">
          <div className="w-13 h-13 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-3 shadow-inner">
            <HelpCircle size={28} className="text-emerald-500 animate-pulse" />
          </div>

          <h3 className="text-lg font-bold text-foreground font-sans tracking-tight">
            Accept Booking?
          </h3>
          <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-[260px]">
            Are you sure you want to accept this booking?
          </p>
        </div>

        {/* Trip Details Preview Box */}
        <div className="bg-surface2/70 border border-border/15 rounded-xl p-3.5 space-y-3">
          {/* Top row: ID & Fare */}
          <div className="flex items-center justify-between pb-2 border-b border-border/10">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-card border border-border/20 text-text-muted">
                #{booking.id.slice(-6).toUpperCase()}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                {booking.type}
              </span>
            </div>
            <div className="text-base font-extrabold text-emerald-500 dark:text-emerald-400">
              ₹{booking.fare}
            </div>
          </div>

          {/* Route details */}
          <div className="space-y-2 text-xs">
            {/* Pickup */}
            <div className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0 ring-4 ring-emerald-500/15" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block leading-none mb-0.5">
                  Pickup Location
                </span>
                <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">
                  {pickupText || 'Pickup address not specified'}
                </p>
              </div>
            </div>

            {/* Drop (if present) */}
            {dropText && (
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-rose-500 shrink-0 ring-4 ring-rose-500/15" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block leading-none mb-0.5">
                    Drop Location
                  </span>
                  <p className="text-xs font-medium text-text-muted line-clamp-2 leading-tight">
                    {dropText}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Date & Package info */}
          <div className="flex items-center justify-between pt-2 border-t border-border/10 text-[11px] text-text-muted">
            <div className="flex items-center gap-1">
              <Calendar size={12} className="text-gold" />
              <span className="font-medium text-foreground">{booking.dateTime}</span>
            </div>
            {booking.duration && (
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-gold" />
                <span>{booking.duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Small Notice */}
        <div className="flex items-start gap-2 px-1">
          <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-text-muted leading-tight">
            Once accepted, this booking will be reserved for you and the customer's contact details will be shared.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-text-muted hover:text-foreground bg-surface2 hover:bg-surface2/80 border border-border/15 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(booking.id)}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <Check size={14} />
                Yes, Accept
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
