'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Clock,
  MapPin,
  Car,
  User,
  Phone,
  PhoneCall,
  PhoneOff,
  CheckCircle2,
  CheckCheck,
  PlayCircle,
  StopCircle,
  FileText,
  DollarSign,
  Award,
  AlertCircle,
  XCircle,
  RefreshCw,
  Navigation,
  Calendar,
  ShieldCheck,
  ArrowRight
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Booking, BookingStatusLog, Driver } from '../types'

interface BookingTimelineModalProps {
  booking: Booking
  driver?: Driver | null
  onClose: () => void
}

interface EnrichedStatusLog extends BookingStatusLog {
  elapsedFromPrevious?: string | null
  elapsedFromStart?: string | null
}

const getStatusConfig = (tripStatus: string, mainStatus: string) => {
  const normalized = (tripStatus || mainStatus || '').toLowerCase()

  switch (normalized) {
    case 'accepted':
      return {
        label: 'Booking Accepted',
        sublabel: 'Driver accepted the booking and unlocked trip details',
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/25',
        badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
      }
    case 'called_customer':
      return {
        label: 'Driver Calling Customer',
        sublabel: 'Driver initiated call to customer to confirm pickup',
        icon: PhoneCall,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/25',
        badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700/50',
      }
    case 'customer_confirmed':
      return {
        label: 'Customer Confirmed',
        sublabel: 'Customer confirmed availability and pickup location',
        icon: CheckCheck,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/25',
        badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
      }
    case 'customer_unreachable':
      return {
        label: 'Customer Unreachable',
        sublabel: 'Customer did not answer driver phone calls',
        icon: PhoneOff,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/25',
        badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-700/50',
      }
    case 'on_the_way':
      return {
        label: 'Driver On The Way',
        sublabel: 'Driver departed towards customer pickup location',
        icon: Navigation,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/25',
        badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50',
      }
    case 'reached_pickup':
      return {
        label: 'Reached Pickup Location',
        sublabel: 'Driver arrived at client location & awaiting customer OTP',
        icon: MapPin,
        color: 'text-violet-400',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/25',
        badgeBg: 'bg-violet-950/80 text-violet-300 border-violet-700/50',
      }
    case 'started':
      return {
        label: 'Trip Started',
        sublabel: 'Customer OTP verified and journey commenced',
        icon: PlayCircle,
        color: 'text-sky-400',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/25',
        badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-700/50',
      }
    case 'ended':
      return {
        label: 'Trip Ended',
        sublabel: 'Driver arrived at destination and ended ride',
        icon: StopCircle,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/25',
        badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-700/50',
      }
    case 'invoice_generated':
      return {
        label: 'Invoice Generated',
        sublabel: 'Fare invoice generated for customer payment',
        icon: FileText,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/25',
        badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700/50',
      }
    case 'payment_received':
      return {
        label: 'Payment Received',
        sublabel: 'Customer completed payment to driver',
        icon: DollarSign,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/25',
        badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
      }
    case 'completed':
      return {
        label: 'Booking Completed',
        sublabel: 'Trip successfully finished and finalized',
        icon: Award,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/25',
        badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
      }
    case 'cancellation_request':
      return {
        label: 'Cancellation Requested',
        sublabel: 'Driver requested cancellation with operations',
        icon: AlertCircle,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/25',
        badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700/50',
      }
    case 'cancelled_by_driver':
    case 'cancelled':
      return {
        label: 'Booking Cancelled',
        sublabel: 'Trip was cancelled',
        icon: XCircle,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/25',
        badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-700/50',
      }
    default:
      return {
        label: tripStatus || mainStatus,
        sublabel: 'Status updated',
        icon: Clock,
        color: 'text-slate-300',
        bg: 'bg-slate-800/40',
        border: 'border-slate-700/50',
        badgeBg: 'bg-slate-900 text-slate-300 border-slate-700',
      }
  }
}

const formatDateTime = (isoString?: string) => {
  if (!isoString) return { date: 'N/A', time: '' }
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return { date: isoString, time: '' }

    const date = d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    const time = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    return { date, time }
  } catch {
    return { date: isoString, time: '' }
  }
}

const formatDuration = (ms: number): string => {
  if (ms < 0) ms = 0
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

export default function BookingTimelineModal({
  booking,
  driver,
  onClose,
}: BookingTimelineModalProps) {
  const [mounted, setMounted] = useState(false)
  const [logs, setLogs] = useState<EnrichedStatusLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Mount to document.body and handle scroll lock + Escape key
  useEffect(() => {
    setMounted(true)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const fetchLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const { data, error } = await supabase
        .from('booking_status_logs')
        .select(`
          id,
          booking_id,
          driver_id,
          status,
          trip_status,
          changed_by,
          metadata,
          created_at,
          timestamp,
          driver:users!booking_status_logs_driver_id_fkey(id, full_name, phone)
        `)
        .eq('booking_id', booking.id)
        .order('created_at', { ascending: true })

      if (error) {
        // Fallback without driver join if foreign key naming differs in PostgREST cache
        const { data: rawData, error: rawError } = await supabase
          .from('booking_status_logs')
          .select('*')
          .eq('booking_id', booking.id)
          .order('created_at', { ascending: true })

        if (rawError) throw rawError
        processLogs(rawData || [])
      } else {
        processLogs(data || [])
      }
    } catch (err) {
      console.error('Error fetching booking status logs:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [booking.id])

  const processLogs = (rawLogs: any[]) => {
    if (!rawLogs.length) {
      setLogs([])
      return
    }

    const firstTime = new Date(rawLogs[0].created_at || rawLogs[0].timestamp).getTime()

    const enriched: EnrichedStatusLog[] = rawLogs.map((log, index) => {
      const currentTime = new Date(log.created_at || log.timestamp).getTime()
      let elapsedFromPrevious: string | null = null
      let elapsedFromStart: string | null = null

      if (index > 0) {
        const prevTime = new Date(
          rawLogs[index - 1].created_at || rawLogs[index - 1].timestamp
        ).getTime()
        const diffMs = currentTime - prevTime
        elapsedFromPrevious = `+${formatDuration(diffMs)}`
      }

      if (index > 0 && !isNaN(firstTime) && !isNaN(currentTime)) {
        elapsedFromStart = formatDuration(currentTime - firstTime)
      }

      return {
        ...log,
        elapsedFromPrevious,
        elapsedFromStart,
      }
    })

    setLogs(enriched)
  }

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  if (!mounted) return null

  const assignedDriverName = driver?.full_name || (logs[0]?.driver as any)?.full_name || 'Not Assigned'
  const assignedDriverPhone = driver?.phone || (logs[0]?.driver as any)?.phone || ''

  // Calculate total trip span from first stage to last
  const totalJourneyDuration =
    logs.length >= 2
      ? formatDuration(
          new Date(logs[logs.length - 1].created_at).getTime() -
            new Date(logs[0].created_at).getTime()
        )
      : null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Trip Status Timeline
                </h3>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 font-bold">
                  {booking.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit trail of driver status transitions with accurate timestamps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLogs(true)}
              disabled={refreshing}
              title="Refresh timeline"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin text-amber-400' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Booking Summary Card */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Customer */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User size={12} className="text-amber-400" /> Customer
                </span>
                <p className="text-sm font-semibold text-white truncate">
                  {booking.customer_name}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {booking.phone}
                </p>
              </div>

              {/* Driver */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Car size={12} className="text-sky-400" /> Driver Assigned
                </span>
                <p className="text-sm font-semibold text-white truncate">
                  {assignedDriverName}
                </p>
                {assignedDriverPhone && (
                  <p className="text-xs text-slate-400 font-mono">
                    {assignedDriverPhone}
                  </p>
                )}
              </div>

              {/* Booking Type & Fare */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar size={12} className="text-purple-400" /> Package & Fare
                </span>
                <p className="text-sm font-semibold text-white">
                  {booking.type}
                </p>
                <p className="text-xs font-bold text-emerald-400 font-mono">
                  ₹{booking.fare} • {booking.vehicle}
                </p>
              </div>

              {/* Metrics */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock size={12} className="text-emerald-400" /> Tracked Updates
                </span>
                <p className="text-sm font-semibold text-white">
                  {logs.length} Milestone{logs.length !== 1 ? 's' : ''}
                </p>
                {totalJourneyDuration && (
                  <p className="text-xs text-slate-400">
                    Span: <span className="font-semibold text-amber-300">{totalJourneyDuration}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Route row */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium shrink-0">
                <MapPin size={13} />
                <span className="truncate max-w-[240px] sm:max-w-[280px] text-slate-200" title={booking.pickup}>
                  {booking.pickup}
                </span>
              </div>
              <ArrowRight size={13} className="text-slate-500 shrink-0 hidden sm:block" />
              <div className="flex items-center gap-1.5 text-rose-400 font-medium shrink-0">
                <MapPin size={13} />
                <span className="truncate max-w-[240px] sm:max-w-[280px] text-slate-200" title={booking.drop}>
                  {booking.drop}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldCheck size={14} className="text-amber-400" /> Milestone Audit Trail
              </h4>
              <span className="text-[11px] text-slate-400">
                Recorded in UTC & Local Time
              </span>
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <div className="h-7 w-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-medium">Loading status history...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 space-y-2">
                <Clock size={28} className="mx-auto text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">No status updates logged yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When the driver interacts with this booking (accepts, marks on the way, reaches pickup, enters OTP, ends ride), each stage will automatically appear here with precise timestamps.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                {logs.map((log, index) => {
                  const isLatest = index === logs.length - 1
                  const config = getStatusConfig(log.trip_status, log.status)
                  const Icon = config.icon
                  const { date, time } = formatDateTime(log.created_at || log.timestamp)

                  return (
                    <div key={log.id || index} className="relative group">
                      {/* Timeline Node Icon */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-1 h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isLatest
                            ? `${config.bg} ${config.border} ${config.color} ring-4 ring-amber-500/20 shadow-lg`
                            : 'bg-slate-950 border-slate-700 text-slate-400'
                        }`}
                      >
                        <Icon size={isLatest ? 15 : 14} />
                      </div>

                      {/* Content Card */}
                      <div
                        className={`rounded-xl border p-4 transition-all ${
                          isLatest
                            ? 'bg-slate-950/90 border-slate-700/90 shadow-md'
                            : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-950/80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          {/* Status Badge & Label */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-white">
                              {config.label}
                            </span>
                            <span
                              className={`text-[9px] uppercase font-mono font-extrabold px-2 py-0.5 rounded-full border ${config.badgeBg}`}
                            >
                              {log.trip_status}
                            </span>
                            {isLatest && (
                              <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                                Current Status
                              </span>
                            )}
                          </div>

                          {/* Timestamps */}
                          <div className="flex items-center gap-2 sm:text-right shrink-0">
                            <div className="text-xs">
                              <span className="font-semibold text-slate-200">{time}</span>
                              <span className="text-[10px] text-slate-400 ml-1.5">({date})</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {config.sublabel}
                        </p>

                        {/* Metadata Footer / Timing Diff */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                          <div className="flex items-center gap-3">
                            {log.elapsedFromPrevious && (
                              <span className="inline-flex items-center gap-1 font-mono text-amber-400/90 font-medium">
                                ⏱️ {log.elapsedFromPrevious} after previous step
                              </span>
                            )}
                            {log.elapsedFromStart && index > 0 && (
                              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-slate-400">
                                Total: {log.elapsedFromStart}
                              </span>
                            )}
                          </div>

                          {/* Extra metadata */}
                          {log.metadata && (
                            <div className="flex items-center gap-2 font-mono text-[10px]">
                              {log.metadata.payment_type && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                  {log.metadata.payment_type}
                                </span>
                              )}
                              {log.metadata.invoice_id && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                  {log.metadata.invoice_id}
                                </span>
                              )}
                              {log.metadata.backfilled && (
                                <span className="text-slate-500 italic">
                                  Initial record
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Automatic live logging active
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
