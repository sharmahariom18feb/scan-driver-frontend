'use client'

import React, { useState } from 'react'
import {
  Briefcase,
  Phone,
  Car,
  Calendar,
  Check,
  X,
  AlertCircle,
  MessageSquare,
  MapPin,
  FileText,
  Star,
  Play,
  Square,
  DollarSign,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Booking } from '@/redux/slices/driverSlice'

interface BookingsTabProps {
  acceptedBookings: Booking[]
  completedBookings: Booking[]
  bookingFilter: 'current' | 'history'
  setBookingFilter: (val: 'current' | 'history') => void
  handleOpenDetails: (booking: Booking) => void
  handleUpdateTripStatus: (
    bookingId: string,
    tripStatus: string,
    paymentType?: 'CASH' | 'QR' | null,
    invoiceId?: string | null
  ) => void
}

const getStatusBadge = (current: string | undefined | null) => {
  switch (current) {
    case 'called_customer':
      return 'Calling Customer'
    case 'customer_unreachable':
      return 'Unreachable'
    case 'customer_confirmed':
      return 'Confirmed'
    case 'cancellation_request':
      return 'Cancellation Requested'
    case 'cancelled_by_driver':
      return 'Cancelled'
    case 'on_the_way':
      return 'On the Way'
    case 'reached_pickup':
      return 'At Pickup'
    case 'started':
      return 'Trip Started'
    case 'ended':
      return 'Trip Ended'
    case 'invoice_generated':
      return 'Invoice Generated'
    case 'payment_received':
      return 'Payment Received'
    case 'completed':
      return 'Completed'
    default:
      return 'Accepted'
  }
}

interface ActiveBookingCardProps {
  booking: Booking
  handleOpenDetails: (booking: Booking) => void
  handleUpdateTripStatus: (
    bookingId: string,
    tripStatus: string,
    paymentType?: 'CASH' | 'QR' | null,
    invoiceId?: string | null
  ) => void
}

function ActiveBookingCard({
  booking,
  handleOpenDetails,
  handleUpdateTripStatus
}: ActiveBookingCardProps) {
  const [otpInput, setOtpInput] = useState('')
  const [otpError, setOtpError] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [qrConfirmed, setQrConfirmed] = useState(false)

  const tripStatus = booking.tripStatus || 'not_started'

  const rawDigits = booking.phone.replace(/\D/g, '')
  const correctOtp = rawDigits.length >= 4 ? rawDigits.slice(-4) : '1234'

  const handleVerifyOtp = () => {
    if (otpInput === correctOtp) {
      setOtpError(false)
      handleUpdateTripStatus(booking.id, 'started')
    } else {
      setOtpError(true)
    }
  }

  const handleEscalateOtp = () => {
    const message = encodeURIComponent(`Escalation: OTP issue for Booking ID: ${booking.id}. Customer ${booking.customerName} (${booking.phone}). Please start the ride manually.`)
    window.open(`https://wa.me/919717498198?text=${message}`, '_blank')
  }

  const handleNotifyUnreachable = () => {
    const message = encodeURIComponent(`Alert: Customer ${booking.customerName} (${booking.phone}) is not picking up the call for Booking ID: ${booking.id}.`)
    window.open(`https://wa.me/919717498198?text=${message}`, '_blank')
  }

  const renderStepper = () => {
    const steps = [
      { label: 'Confirm', icon: Phone, statuses: ['not_started', 'accepted', 'called_customer', 'customer_unreachable', 'customer_confirmed', 'cancellation_request'] },
      { label: 'On Way', icon: Car, statuses: ['on_the_way'] },
      { label: 'Arrived', icon: MapPin, statuses: ['reached_pickup'] },
      { label: 'Trip', icon: Play, statuses: ['started', 'ended'] },
      { label: 'Payment', icon: DollarSign, statuses: ['invoice_generated', 'payment_received'] }
    ]

    let currentIndex = 0
    if (steps[0].statuses.includes(tripStatus)) currentIndex = 0
    else if (steps[1].statuses.includes(tripStatus)) currentIndex = 1
    else if (steps[2].statuses.includes(tripStatus)) currentIndex = 2
    else if (steps[3].statuses.includes(tripStatus)) currentIndex = 3
    else if (steps[4].statuses.includes(tripStatus)) currentIndex = 4
    else currentIndex = 5

    return (
      <div className="flex items-center justify-between w-full mb-6 bg-surface2/30 px-3 py-2.5 rounded-xl border border-border/5">
        {steps.map((step, idx) => {
          const Icon = step.icon
          const isActive = idx === currentIndex
          const isCompleted = idx < currentIndex
          
          return (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center gap-1 flex-1 relative">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border transition-all duration-300",
                    isActive 
                      ? "bg-gold text-black border-gold shadow-md shadow-gold/10 scale-105 font-bold" 
                      : isCompleted 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "bg-surface text-text-muted border-border/10"
                  )}
                >
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : <Icon size={12} />}
                </div>
                <span 
                  className={cn(
                    "text-[8px] uppercase tracking-wider font-bold",
                    isActive ? "text-gold-light" : isCompleted ? "text-emerald-500" : "text-text-muted"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div 
                  className={cn(
                    "h-[1.5px] -mt-3.5 flex-1 bg-border/10 mx-1 rounded",
                    idx < currentIndex ? "bg-emerald-500" : ""
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  const renderActionArea = () => {
    switch (tripStatus) {
      case 'not_started':
      case 'accepted':
        return (
          <div className="space-y-3">
            <div className="bg-surface2/20 border border-border/10 p-4 rounded-xl text-center space-y-3">
              <p className="text-xs text-text-muted leading-relaxed">
                Contact the customer to confirm their availability and location details.
              </p>
              <a
                href={`tel:${booking.phone}`}
                onClick={() => {
                  handleUpdateTripStatus(booking.id, 'called_customer')
                }}
                className="w-full py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md bg-gold hover:bg-gold/90 text-black flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98]"
              >
                <Phone size={14} /> Call Customer
              </a>
            </div>
          </div>
        )

      case 'called_customer':
        return (
          <div className="space-y-3">
            <div className="bg-surface2/30 border border-border/10 p-4 rounded-xl text-center space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Reachability Verification</p>
              <p className="text-sm font-semibold text-foreground">Is the customer reachable?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleUpdateTripStatus(booking.id, 'customer_confirmed')}
                  className="py-3 px-3 font-bold text-xs uppercase tracking-wider rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  <Check size={14} /> Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateTripStatus(booking.id, 'customer_unreachable')}
                  className="py-3 px-3 font-bold text-xs uppercase tracking-wider rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-1 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  <X size={14} /> No
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleUpdateTripStatus(booking.id, 'cancellation_request')}
                className="w-full py-2.5 px-4 font-bold text-xs uppercase tracking-wider rounded-xl border border-rose-500/20 text-rose-500 hover:border-rose-500 hover:bg-rose-500/10 flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                <X size={14} /> Cancel Booking
              </button>
            </div>
          </div>
        )

      case 'customer_unreachable':
        return (
          <div className="space-y-3">
            <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-center space-y-4">
              <div className="flex justify-center text-rose-500">
                <AlertCircle size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">Customer Not Picking Up</p>
                <p className="text-xs text-text-muted">Notify operations to request guidance or booking cancellation.</p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleNotifyUnreachable}
                  className="w-full py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  <MessageSquare size={14} /> Notify Operations
                </button>
                <button
                  onClick={() => handleUpdateTripStatus(booking.id, 'not_started')}
                  className="w-full py-2.5 px-4 font-bold text-xs uppercase tracking-wider rounded-xl border border-border/10 text-foreground hover:bg-surface transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  Retry calling customer
                </button>
              </div>
            </div>
          </div>
        )

      case 'customer_confirmed':
        return (
          <div className="space-y-3">
            <button
              onClick={() => handleUpdateTripStatus(booking.id, 'on_the_way')}
              className="w-full py-3.5 px-4 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <Car size={14} /> On the Way
            </button>
          </div>
        )

      case 'cancellation_request':
        return (
          <div className="space-y-3">
            <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-center space-y-4">
              <div className="flex justify-center text-rose-500">
                <AlertCircle size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">Cancellation Workflow</p>
                <p className="text-xs text-text-muted">Confirming this will close this booking and flag it as cancelled.</p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => handleUpdateTripStatus(booking.id, 'cancelled_by_driver')}
                  className="w-full py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  Confirm Cancellation
                </button>
                <button
                  onClick={() => handleUpdateTripStatus(booking.id, 'called_customer')}
                  className="w-full py-2.5 px-4 font-bold text-xs uppercase tracking-wider rounded-xl border border-border/10 text-foreground hover:bg-surface transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  Keep Booking
                </button>
              </div>
            </div>
          </div>
        )

      case 'on_the_way':
        return (
          <div className="space-y-3">
            <button
              onClick={() => handleUpdateTripStatus(booking.id, 'reached_pickup')}
              className="w-full py-3.5 px-4 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <MapPin size={14} /> Reached Pickup Location
            </button>
          </div>
        )

      case 'reached_pickup':
        return (
          <div className="space-y-3">
            <div className="bg-surface2/30 border border-border/10 p-4 rounded-xl space-y-4">
              <div className="space-y-1 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted">OTP Verification</p>
                <p className="text-sm font-semibold text-foreground">Enter Ride OTP from customer</p>
                <p className="text-[10px] text-emerald-500 font-mono">
                  For testing, use suffix of customer phone: <span className="font-bold underline">{correctOtp}</span>
                </p>
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, ''))
                    setOtpError(false)
                  }}
                  placeholder="Enter 4-digit OTP"
                  className={cn(
                    "w-full text-center py-3 bg-surface border rounded-xl text-lg font-bold font-mono tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-primary",
                    otpError ? "border-rose-500 focus:ring-rose-500" : "border-border/10"
                  )}
                />
                {otpError && (
                  <p className="text-[10px] text-rose-500 text-center font-semibold">
                    Incorrect OTP. Please retry or escalate to operations.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleVerifyOtp}
                  className="py-3 px-3 font-bold text-xs uppercase tracking-wider rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  Verify & Start
                </button>
                <button
                  onClick={handleEscalateOtp}
                  className="py-3 px-3 font-bold text-xs uppercase tracking-wider rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-1 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  Escalate
                </button>
              </div>
            </div>
          </div>
        )

      case 'started':
        return (
          <div className="space-y-3">
            <button
              onClick={() => handleUpdateTripStatus(booking.id, 'ended')}
              className="w-full py-3.5 px-4 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <Square size={14} /> End Ride
            </button>
          </div>
        )

      case 'ended':
        return (
          <div className="space-y-3">
            <div className="bg-surface2/30 border border-border/10 p-4 rounded-xl text-center space-y-3">
              <p className="text-sm font-semibold text-foreground">Trip Has Ended</p>
              <p className="text-xs text-text-muted">Please generate the customer invoice to receive payment.</p>
              <button
                onClick={() => {
                  const generatedInvoiceId = `INV-${booking.id}-${Math.floor(1000 + Math.random() * 9000)}`;
                  handleUpdateTripStatus(booking.id, 'invoice_generated', null, generatedInvoiceId);
                }}
                className="w-full py-3.5 px-4 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                <FileText size={14} /> Generate Invoice
              </button>
            </div>
          </div>
        )

      case 'invoice_generated':
        return (
          <div className="space-y-3">
            <div className="bg-surface2/30 border border-border/10 p-4 rounded-xl space-y-4">
              <div className="space-y-1 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Payment Collection</p>
                <p className="text-2xl font-bold text-emerald-500 font-sans">₹{booking.fare}</p>
                {booking.invoiceId && (
                  <p className="text-[10px] text-text-muted font-mono mt-1">
                    Invoice ID: <span className="text-gold-light font-bold">{booking.invoiceId}</span>
                  </p>
                )}
              </div>

              <div className="space-y-3 flex flex-col items-center p-3 bg-surface rounded-lg border border-border/5">
                <div className="w-28 h-28 relative bg-white p-2 rounded-lg flex items-center justify-center border">
                  <div className="w-full h-full border-2 border-slate-900 border-dashed animate-pulse flex flex-col items-center justify-center text-[10px] text-slate-800 font-bold">
                    <span className="text-[16px] mb-1">📷</span>
                    <span>[ QR CODE ]</span>
                  </div>
                </div>
                <p className="text-[9px] text-text-muted text-center leading-normal">
                  Customer scans and pays directly.
                </p>
                
                <button
                  type="button"
                  onClick={() => setQrConfirmed(prev => !prev)}
                  className={cn(
                    "w-full py-1.5 px-3 text-[10px] font-bold uppercase rounded-lg border transition-all cursor-pointer",
                    qrConfirmed 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "border-border/10 text-foreground hover:bg-surface2"
                  )}
                >
                  {qrConfirmed ? "✓ QR Payment Detected" : "Simulate QR Payment Received"}
                </button>
              </div>

              <button
                onClick={() => {
                  handleUpdateTripStatus(booking.id, 'payment_received', 'QR', booking.invoiceId);
                }}
                disabled={!qrConfirmed}
                className={cn(
                  "w-full py-3.5 px-4 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98] cursor-pointer",
                  qrConfirmed
                    ? "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                    : "bg-surface text-text-muted border border-border/10 cursor-not-allowed opacity-50"
                )}
              >
                <DollarSign size={14} /> Confirm Payment Received
              </button>
            </div>
          </div>
        )

      case 'payment_received':
        return (
          <div className="space-y-3">
            <div className="bg-surface2/30 border border-border/10 p-4 rounded-xl space-y-4">
              <div className="space-y-1 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Complete Trip</p>
                <p className="text-sm font-semibold text-foreground">Rate passenger & close booking</p>
              </div>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform active:scale-110 cursor-pointer"
                  >
                    <Star
                      size={24}
                      className={cn(
                        "transition-colors",
                        star <= rating ? "fill-gold text-gold" : "text-text-muted opacity-40"
                      )}
                    />
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold">Feedback or complaints (Optional)</p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Leave comment or report complaint if any..."
                  rows={2}
                  className="w-full p-2 bg-surface border border-border/10 rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                onClick={() => handleUpdateTripStatus(booking.id, 'completed', booking.paymentType, booking.invoiceId)}
                className="w-full py-3.5 px-4 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                Submit & Close Booking
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-card border border-primary/25 rounded-xl p-5 shadow-lg relative overflow-hidden transition-all duration-300">
      <div 
        className={cn(
          "absolute top-0 left-0 w-1.5 h-full transition-colors duration-300",
          tripStatus === 'completed' || tripStatus === 'cancelled_by_driver' 
            ? "bg-rose-500" 
            : tripStatus === 'started' 
              ? "bg-blue-600" 
              : "bg-emerald-500"
        )}
      />

      {renderStepper()}

      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              {getStatusBadge(tripStatus)}
            </span>
            <button
              onClick={() => handleOpenDetails(booking)}
              className="text-text-muted hover:text-gold-light p-1 rounded-full hover:bg-surface2 transition-all flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
            >
              <Info size={11} /> Details
            </button>
          </div>
          <span className="text-[10px] font-mono text-text-muted tracking-wider block">
            Booking ID: {booking.id}
          </span>
        </div>
        <span
          className={cn(
            'text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border',
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

      <h4 
        onClick={() => handleOpenDetails(booking)}
        className="font-bold text-lg text-foreground mb-3 hover:text-gold-light hover:underline transition-colors cursor-pointer inline-block"
      >
        {booking.customerName}
      </h4>

      <div className="space-y-3 relative pl-4 before:content-[''] before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/15">
        <div className="relative">
          <span className="absolute -left-4.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
          <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold leading-none mb-1">Pickup</p>
          <p className="text-xs text-foreground font-medium truncate">{booking.pickup}</p>
        </div>
        <div className="relative">
          <span className="absolute -left-4.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 ring-4 ring-amber-500/10" />
          <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold leading-none mb-1">Drop</p>
          <p className="text-xs text-foreground font-medium truncate">{booking.drop}</p>
        </div>
      </div>

      <div className="mt-4.5 pt-3.5 border-t border-border/10 text-xs space-y-2 text-text-muted bg-surface2/20 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5"><Phone size={12} /> Contact:</span>
          <a
            href={`tel:${booking.phone}`}
            className="font-semibold text-gold-light hover:underline bg-gold/10 px-2 py-0.5 rounded flex items-center gap-1"
          >
            {booking.phone}
          </a>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5"><Car size={12} /> Vehicle Spec:</span>
          <span className="text-foreground font-semibold">{booking.vehicle}</span>
        </div>
        {booking.duration && booking.distance && (
          <div className="flex justify-between items-center">
            <span>Est. Duration & Distance:</span>
            <span className="text-foreground font-medium">
              {booking.duration} ({booking.distance})
            </span>
          </div>
        )}
      </div>

      <div className="mt-4.5 pt-1.5">
        {renderActionArea()}
      </div>

      <div className="border-t border-border/10 mt-4.5 pt-3.5 flex items-center justify-between">
        <span className="font-semibold text-[10px] text-text-muted flex items-center gap-1">
          <Calendar size={12} /> {booking.dateTime}
        </span>
        <div className="text-right">
          <span className="block text-[9px] text-text-muted uppercase tracking-wider leading-none mb-1">Total Fare</span>
          <span className="font-extrabold text-2xl text-emerald-500">
            ₹{booking.fare}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function BookingsTab({
  acceptedBookings,
  completedBookings,
  bookingFilter,
  setBookingFilter,
  handleOpenDetails,
  handleUpdateTripStatus,
}: BookingsTabProps) {

  return (
    <div className="px-5 py-6 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-foreground font-sans">
        My Bookings
      </h2>

      {/* Filter Buttons */}
      <div className="flex bg-surface2 p-1 rounded-lg border border-border/10">
        <button
          onClick={() => setBookingFilter('current')}
          className={cn(
            'flex-1 text-center py-2 text-sm font-semibold rounded-md transition-all duration-300 cursor-pointer',
            bookingFilter === 'current' ? 'bg-primary text-black' : 'text-text-muted hover:text-foreground'
          )}
        >
          Current Trip ({acceptedBookings.length})
        </button>
        <button
          onClick={() => setBookingFilter('history')}
          className={cn(
            'flex-1 text-center py-2 text-sm font-semibold rounded-md transition-all duration-300 cursor-pointer',
            bookingFilter === 'history' ? 'bg-primary text-black' : 'text-text-muted hover:text-foreground'
          )}
        >
          Booking History ({completedBookings.length})
        </button>
      </div>

      {bookingFilter === 'current' ? (
        /* Current Trip List */
        acceptedBookings.length === 0 ? (
          <div className="bg-card border border-border/10 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 text-text-muted">
            <Briefcase size={24} className="opacity-40 animate-pulse" />
            <p className="text-sm">No active trip in progress.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {acceptedBookings.map((booking) => (
              <ActiveBookingCard
                key={booking.id}
                booking={booking}
                handleOpenDetails={handleOpenDetails}
                handleUpdateTripStatus={handleUpdateTripStatus}
              />
            ))}
          </div>
        )
      ) : (
        /* Booking History List */
        completedBookings.length === 0 ? (
          <div className="bg-card border border-border/10 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 text-text-muted">
            <Briefcase size={24} className="opacity-40" />
            <p className="text-sm">No past bookings found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-card border border-border/10 rounded-xl p-4 shadow-sm relative overflow-hidden transition-all duration-300"
              >
                {/* Top Row: Booking ID and Trip Type */}
                <div className="flex items-center justify-between mb-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-text-muted tracking-wider block">
                      BOOKING ID
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground font-mono">
                        {booking.id}
                      </span>
                      <span
                        className={cn(
                          'text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider',
                          (booking.tripStatus === 'cancelled_by_driver' || booking.tripStatus === 'cancelled')
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        )}
                      >
                        {booking.tripStatus === 'cancelled_by_driver' || booking.tripStatus === 'cancelled' ? 'Cancelled' : 'Completed'}
                      </span>
                    </div>
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

                {/* Bottom Row: Date & Time and Earnings */}
                <div className="border-t border-border/10 mt-3 pt-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-text-muted tracking-wider block">
                      DATE & TIME
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {booking.dateTime}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-text-muted tracking-wider block leading-none mb-1">
                      EARNINGS
                    </span>
                    <span
                      className={cn(
                        'font-extrabold text-2xl',
                        (booking.tripStatus === 'cancelled_by_driver' || booking.tripStatus === 'cancelled')
                          ? 'text-rose-500 line-through opacity-60'
                          : 'text-emerald-500'
                      )}
                    >
                      ₹{booking.fare}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
