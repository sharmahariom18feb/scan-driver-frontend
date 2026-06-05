'use client'

import React, { useState } from 'react'
import { Search, ShieldCheck, UserCheck, ShieldAlert, Star, Phone, MapPin, Award, CheckCircle, Ban } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Driver } from '../types'

interface DriversTabProps {
  drivers: Driver[]
  onRefresh: () => void
}

export default function DriversTab({ drivers, onRefresh }: DriversTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all')
  const [onlineFilter, setOnlineFilter] = useState<'all' | 'online' | 'offline'>('all')

  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Filter Drivers
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm) ||
      d.license_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.current_area.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesVerification =
      verificationFilter === 'all'
        ? true
        : verificationFilter === 'verified'
        ? d.verified
        : !d.verified

    const matchesOnline =
      onlineFilter === 'all'
        ? true
        : onlineFilter === 'online'
        ? d.is_online
        : !d.is_online

    return matchesSearch && matchesVerification && matchesOnline
  })

  // Verify/Suspend Action
  const toggleVerification = async (driverId: string, currentStatus: boolean) => {
    setUpdatingId(driverId)
    const newStatus = !currentStatus

    try {
      const { error } = await supabase
        .from('users')
        .update({ verified: newStatus })
        .eq('id', driverId)

      if (error) throw error

      toast.success(`Driver verification ${newStatus ? 'Approved' : 'Suspended'}!`)

      // Add a system notification to the driver
      await supabase.from('notifications').insert({
        driver_id: driverId,
        title: newStatus ? 'Account Approved!' : 'Account Suspended',
        description: newStatus 
          ? 'Your ScanDriver profile has been verified and approved by the administrator. You are now authorized to accept rides!' 
          : 'Your account has been temporarily suspended by the administrator. Contact support for details.',
        time: 'Just now',
        type: 'system',
        read: false,
      })

      onRefresh()
    } catch (err: any) {
      console.error('Error toggling driver verification:', err)
      toast.error(err.message || 'Failed to update verification status')
    } finally {
      setUpdatingId(null)
    }
  }

  // Force Toggle Online Action (For Admin convenience/testing)
  const toggleOnline = async (driverId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_online: !currentStatus })
        .eq('id', driverId)

      if (error) throw error
      toast.success(`Driver set to ${!currentStatus ? 'Online' : 'Offline'}`)
      onRefresh()
    } catch (err: any) {
      console.error('Error toggling online status:', err)
      toast.error(err.message || 'Failed to update online status')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-white">Drivers</h1>
        <p className="text-slate-200 text-xs mt-1">Verify licenses, manage account status, and track online drivers.</p>
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
            placeholder="Search by name, phone, license, area..."
          />
        </div>

        {/* Verification Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700">
          {(['all', 'verified', 'pending'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setVerificationFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                verificationFilter === status
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-350 hover:text-white'
              }`}
            >
              {status === 'pending' ? 'Pending Approval' : status}
            </button>
          ))}
        </div>

        {/* Online Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700">
          {(['all', 'online', 'offline'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setOnlineFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                onlineFilter === status
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-350 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Drivers List */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-[10px] uppercase font-bold tracking-widest text-slate-300">
                <th className="py-4 px-5">Driver Name</th>
                <th className="py-4 px-5">Mobile</th>
                <th className="py-4 px-5">License</th>
                <th className="py-4 px-5">Area & Rating</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400 italic">
                    No drivers registered matching current filters.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-all text-xs">
                    {/* Name */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center font-extrabold text-slate-400">
                          {d.first_name?.[0]}{d.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-extrabold text-white flex items-center gap-1.5">
                            {d.first_name} {d.last_name}
                            {d.verified && <ShieldCheck size={14} className="text-emerald-400" />}
                          </p>
                          <p className="text-[10px] text-slate-350 font-semibold">{d.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-100 flex items-center gap-1">
                        <Phone size={11} className="text-slate-450 shrink-0" /> {d.phone}
                      </p>
                    </td>

                    {/* License */}
                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <p className="font-bold text-white tracking-wide font-mono uppercase">{d.license_no}</p>
                        <p className="text-[9px] text-slate-350 uppercase tracking-widest font-bold flex items-center gap-1">
                          <Award size={10} className="text-amber-500" /> Professional Class
                        </p>
                      </div>
                    </td>

                    {/* Rating & Area */}
                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <p className="text-slate-100 font-bold flex items-center gap-1">
                          <MapPin size={11} className="text-slate-450 shrink-0" /> {d.current_area}
                        </p>
                        <p className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                          <Star size={10} className="fill-amber-450" /> {Number(d.rating).toFixed(2)} / 5.0
                        </p>
                      </div>
                    </td>

                    {/* Online status */}
                    <td className="py-4 px-5">
                      <button
                        onClick={() => toggleOnline(d.id, d.is_online)}
                        className="flex items-center gap-1.5 hover:underline text-left cursor-pointer bg-transparent border-0 p-0"
                      >
                        <span className={`h-2 w-2 rounded-full ${d.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                        <span className="font-bold text-slate-200">{d.is_online ? 'Online' : 'Offline'}</span>
                      </button>
                    </td>

                    {/* Verification Toggle */}
                    <td className="py-4 px-5 text-right">
                      {d.verified ? (
                        <button
                          onClick={() => toggleVerification(d.id, d.verified)}
                          disabled={updatingId === d.id}
                          className="inline-flex items-center gap-1 bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-500 hover:text-slate-950 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Ban size={12} /> SUSPEND
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleVerification(d.id, d.verified)}
                          disabled={updatingId === d.id}
                          className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/5"
                        >
                          <UserCheck size={12} /> APPROVE & ACTIVATE
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="block md:hidden divide-y divide-slate-800/80">
          {filteredDrivers.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-400 italic">No drivers found.</p>
          ) : (
            filteredDrivers.map((d) => (
              <div key={d.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-slate-950 border border-slate-850 rounded-full flex items-center justify-center font-extrabold text-slate-400 text-xs">
                      {d.first_name?.[0]}{d.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-extrabold text-white flex items-center gap-1 text-xs">
                        {d.first_name} {d.last_name}
                        {d.verified && <ShieldCheck size={14} className="text-emerald-400" />}
                      </p>
                      <p className="text-[9px] text-slate-450 font-semibold">{d.email}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      d.verified
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {d.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <div className="space-y-1 text-slate-200 text-[11px] font-semibold">
                  <p>License: <span className="font-mono text-white font-bold">{d.license_no}</span></p>
                  <p>Mobile: {d.phone}</p>
                  <p>Area: {d.current_area} • Rating: {Number(d.rating).toFixed(2)}★</p>
                  <p className="flex items-center gap-1 mt-1 font-semibold">
                    Status: <span className={`h-1.5 w-1.5 rounded-full ${d.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                    <span className="font-bold text-slate-200">{d.is_online ? 'Online' : 'Offline'}</span>
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-850 flex justify-end">
                  {d.verified ? (
                    <button
                      onClick={() => toggleVerification(d.id, d.verified)}
                      disabled={updatingId === d.id}
                      className="bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-500 hover:text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                    >
                      Suspend Account
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleVerification(d.id, d.verified)}
                      disabled={updatingId === d.id}
                      className="bg-emerald-500 text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer shadow-md"
                    >
                      Verify & Approve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
