'use client'

import React from 'react'
import { Briefcase, Users, CheckCircle, Clock, ShieldAlert, Activity, ArrowRight } from 'lucide-react'
import { DashboardStats, Booking, Driver } from '../types'

interface DashboardTabProps {
  stats: DashboardStats
  recentBookings: Booking[]
  recentDrivers: Driver[]
  onTabChange: (tab: 'bookings' | 'drivers') => void
}

export default function DashboardTab({
  stats,
  recentBookings,
  recentDrivers,
  onTabChange,
}: DashboardTabProps) {
  // Helpers
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

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-white">System Overview</h1>
        <p className="text-slate-300 text-xs mt-1">Real-time operation metrics for ScanDriver.</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-slate-900 border border-slate-700/80 p-5 rounded-2xl flex items-center gap-4 hover:border-amber-500/40 transition-all duration-300 shadow-md">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-300">Total Bookings</p>
            <p className="text-2xl font-extrabold text-white mt-0.5">{stats.totalBookings}</p>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-slate-900 border border-slate-700/80 p-5 rounded-2xl flex items-center gap-4 hover:border-sky-500/40 transition-all duration-300 shadow-md">
          <div className="h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-300">Active / Open</p>
            <p className="text-2xl font-extrabold text-white mt-0.5">{stats.availableBookings + stats.acceptedBookings}</p>
          </div>
        </div>

        {/* Total Drivers */}
        <div className="bg-slate-900 border border-slate-700/80 p-5 rounded-2xl flex items-center gap-4 hover:border-emerald-500/40 transition-all duration-300 shadow-md">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-300">Total Drivers</p>
            <p className="text-2xl font-extrabold text-white mt-0.5">{stats.totalDrivers}</p>
          </div>
        </div>

        {/* Drivers Online */}
        <div className="bg-slate-900 border border-slate-700/80 p-5 rounded-2xl flex items-center gap-4 hover:border-violet-500/40 transition-all duration-300 shadow-md">
          <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-300">Drivers Online</p>
            <p className="text-2xl font-extrabold text-white mt-0.5">{stats.onlineDrivers}</p>
          </div>
        </div>
      </div>

      {/* Pending Approval Warning */}
      {stats.pendingDriversCount > 0 && (
        <div className="bg-amber-950/60 border border-amber-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-400">{stats.pendingDriversCount} Driver Registrations Pending Verification</p>
              <p className="text-[11px] text-slate-200 mt-0.5">Please review their driving licenses and details to approve them.</p>
            </div>
          </div>
          <button
            onClick={() => onTabChange('drivers')}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline shrink-0 cursor-pointer"
          >
            Review Now <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Bookings Pending Approval Warning */}
      {stats.pendingBookingsCount > 0 && (
        <div className="bg-amber-950/60 border border-amber-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 shrink-0">
              <Briefcase size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-400">{stats.pendingBookingsCount} Bookings Pending Approval</p>
              <p className="text-[11px] text-slate-200 mt-0.5">These bookings are not visible to drivers. Please review and approve them.</p>
            </div>
          </div>
          <button
            onClick={() => onTabChange('bookings')}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline shrink-0 cursor-pointer"
          >
            Review Now <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Grid: Recent Bookings & Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings Panel */}
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase size={16} className="text-amber-400" />
              Recent Bookings
            </h2>
            <button
              onClick={() => onTabChange('bookings')}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          <div className="divide-y divide-slate-800 overflow-hidden">
            {recentBookings.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No bookings recorded yet.</p>
            ) : (
              recentBookings.slice(0, 5).map((b) => (
                <div key={b.id} className="py-3 flex justify-between items-center gap-4 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-white">{b.id}</span>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-750">
                        {b.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-semibold">{b.customer_name} • {b.vehicle}</p>
                    <p className="text-[10px] text-slate-400">{formatTime(b.created_at)}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-xs font-bold text-white">₹{b.fare}</p>
                    <span
                      className={`inline-block text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        b.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : b.status === 'accepted'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : b.status === 'passed'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Drivers Panel */}
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users size={16} className="text-emerald-400" />
              New Drivers
            </h2>
            <button
              onClick={() => onTabChange('drivers')}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          <div className="divide-y divide-slate-800 overflow-hidden">
            {recentDrivers.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No drivers registered yet.</p>
            ) : (
              recentDrivers.slice(0, 5).map((d) => (
                <div key={d.id} className="py-3 flex justify-between items-center gap-4 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">{d.first_name} {d.last_name}</p>
                    <p className="text-[10px] text-slate-200">{d.phone} • {d.current_area}</p>
                    <p className="text-[10px] text-slate-400">Joined {formatTime(d.created_at)}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <span
                      className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        d.verified
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {d.verified ? 'Verified' : 'Pending Approval'}
                    </span>
                    <p className="text-[10px] text-slate-300 flex items-center justify-end gap-1 font-semibold">
                      <span className={`h-1.5 w-1.5 rounded-full ${d.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                      {d.is_online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
