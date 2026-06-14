'use client'

import React from 'react'
import {
  User as UserIcon,
  FileText,
  MapPin,
  Calendar,
  Clock,
  Car,
  Check,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Booking } from '@/redux/slices/driverSlice'

interface BookingDetailModalProps {
  isOpen: boolean
  booking: Booking
  onClose: () => void
  onAccept: (id: string) => void
  onPass: (id: string) => void
}

export default function BookingDetailModal({
  isOpen,
  booking,
  onClose,
  onAccept,
  onPass,
}: BookingDetailModalProps) {
  if (!isOpen) return null

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center transition-all duration-300 animate-in fade-in">
      {/* Backdrop Closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full bg-card border-t border-border/20 rounded-t-2xl max-h-[85%] overflow-y-auto px-5 pt-6 pb-8 shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
        {/* Grab handle indicator */}
        <div className="w-12 h-1 bg-border/20 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between border-b border-border/10 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
              {booking.id} Details
            </span>
            <h3 className="font-bold text-xl text-foreground font-sans">
              Trip Information
            </h3>
          </div>
          <span
            className={cn(
              'text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border',
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

        {/* Fare callout */}
        <div className="bg-surface2/60 border border-border/10 p-3 rounded-lg flex items-center justify-between mb-5">
          <span className="text-sm text-text-muted font-medium">Estimated Earnings</span>
          <span className="font-bold text-2xl text-emerald-500">₹{booking.fare}</span>
        </div>

        <div className="space-y-5 flex-1">
          {/* Customer Info */}
          <div className="space-y-3.5">
            <h4 className="font-bold text-sm uppercase tracking-wider text-text-muted">
              Customer & Trip
            </h4>

            <div className="space-y-4">
              {/* Customer Name */}
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                  <UserIcon size={14} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-text-muted leading-none">Customer Name</p>
                  <p className="text-sm font-semibold text-foreground">{booking.customerName}</p>
                </div>
              </div>

              {/* Phone Masked */}
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                  <FileText size={14} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-text-muted leading-none">Phone (shared after acceptance)</p>
                  <p className="text-sm font-mono font-semibold tracking-wider text-text-muted">
                    {booking.status === 'accepted' ? booking.phone : '**********'}
                  </p>
                </div>
              </div>

              {/* Locations */}
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                  <MapPin size={14} className="text-emerald-500" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-text-muted leading-none">Pickup From</p>
                  <p className="text-sm font-semibold text-foreground leading-normal">{booking.pickup}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                  <MapPin size={14} className="text-amber-500" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-text-muted leading-none">Drop To</p>
                  <p className="text-sm font-semibold text-foreground leading-normal">{booking.drop}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                  <Calendar size={14} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-text-muted leading-none">Date & Time</p>
                  <p className="text-sm font-semibold text-foreground">{booking.dateTime}</p>
                </div>
              </div>

              {/* Duration / Distance */}
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                  <Clock size={14} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-text-muted leading-none">Duration / Distance</p>
                  <p className="text-sm font-semibold text-foreground">
                    ~{booking.duration} • {booking.distance}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle & Notes */}
          <div className="space-y-3.5 pt-2">
            <h4 className="font-bold text-sm uppercase tracking-wider text-text-muted">
              Vehicle & Notes
            </h4>

            <div className="space-y-4">
              {/* Client Vehicle */}
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                  <Car size={14} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-text-muted leading-none">Client Vehicle</p>
                  <p className="text-sm font-semibold text-foreground">
                    {booking.status === 'accepted' ? booking.vehicle : 'Honda City - HR26-AB1234 (Masked)'}
                  </p>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded bg-surface border border-border/10 flex items-center justify-center text-text-muted shrink-0">
                  <FileText size={14} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-text-muted leading-none">Special Instructions</p>
                  <p className="text-sm italic text-foreground leading-normal">
                    "{booking.specialInstructions}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          {booking.status === 'available' ? (
            <>
              <button
                onClick={() => onAccept(booking.id)}
                className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check size={16} /> ACCEPT
              </button>
              <button
                onClick={() => onPass(booking.id)}
                className="py-3 px-4 bg-surface2 hover:bg-surface2/80 text-text-muted font-bold text-base rounded-lg shadow-sm border border-border/15 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle size={16} /> PASS
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="col-span-2 py-3 px-4 bg-surface2 hover:bg-surface2/80 text-foreground font-bold text-base rounded-lg shadow-sm border border-border/15 transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              CLOSE DETAILS
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
