'use client'

import React, { useState } from 'react'
import { Search, ShieldCheck, UserCheck, ShieldAlert, Star, Phone, MapPin, Award, CheckCircle, Ban, Key } from 'lucide-react'
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
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null)

  const getProfile = (d: Driver) => {
    if (!d.driver_profiles) return null
    if (Array.isArray(d.driver_profiles)) {
      return d.driver_profiles[0] || null
    }
    return d.driver_profiles
  }

  // Password reset states
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [targetDriverId, setTargetDriverId] = useState<string | null>(null)
  const [targetDriverName, setTargetDriverName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)

  const openResetModal = (driverId: string, driverName: string) => {
    setTargetDriverId(driverId)
    setTargetDriverName(driverName)
    setNewPassword('')
    setResetModalOpen(true)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetDriverId || !newPassword) return

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setResettingPassword(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('You must be logged in as admin to perform this action')
      }

      const response = await fetch('/api/reset-driver-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          driverId: targetDriverId,
          newPassword: newPassword
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password')
      }

      toast.success('Driver password reset successfully!')
      setResetModalOpen(false)
    } catch (err: any) {
      console.error('Password reset error:', err)
      toast.error(err.message || 'An error occurred during password reset')
    } finally {
      setResettingPassword(false)
    }
  }

  // Filter Drivers
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Reject/Delete Driver Action
  const handleRejectDriver = async (driverId: string) => {
    const confirmReject = window.confirm('Are you sure you want to reject and delete this driver request?')
    if (!confirmReject) return

    setUpdatingId(driverId)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('You must be logged in as admin to perform this action')
      }

      const response = await fetch('/api/delete-driver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ driverId })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject driver')
      }

      toast.success('Driver application rejected and deleted successfully!')
      onRefresh()
    } catch (err: any) {
      console.error('Error rejecting driver:', err)
      toast.error(err.message || 'Failed to reject driver')
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
                  <React.Fragment key={d.id}>
                    <tr className="hover:bg-slate-800/30 transition-all text-xs">
                    {/* Name */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center font-extrabold text-slate-400">
                          {(d.full_name || '').split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() || ''}
                        </div>
                        <div>
                          <p className="font-extrabold text-white flex items-center gap-1.5">
                            {d.full_name}
                            {d.verified && <ShieldCheck size={14} className="text-emerald-400" />}
                          </p>
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

                    {/* Verification Toggle & Reset Password */}
                    <td className="py-4 px-5 text-right whitespace-nowrap space-x-2">
                      {d.verified ? (
                        <button
                          onClick={() => toggleVerification(d.id, d.verified)}
                          disabled={updatingId === d.id}
                          className="inline-flex items-center gap-1 bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-500 hover:text-slate-950 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Ban size={12} /> SUSPEND
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleVerification(d.id, d.verified)}
                            disabled={updatingId === d.id}
                            className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/5"
                          >
                            <UserCheck size={12} /> APPROVE
                          </button>
                          <button
                            onClick={() => handleRejectDriver(d.id)}
                            disabled={updatingId === d.id}
                            className="inline-flex items-center gap-1 bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-500 hover:text-slate-950 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Ban size={12} /> REJECT
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openResetModal(d.id, d.full_name)}
                        className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer border border-slate-700"
                      >
                        <Key size={12} /> RESET PASSWORD
                      </button>
                      <button
                        onClick={() => setExpandedDriverId(expandedDriverId === d.id ? null : d.id)}
                        className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer border border-slate-700"
                      >
                        {expandedDriverId === d.id ? 'HIDE DETAILS' : 'VIEW DETAILS'}
                      </button>
                    </td>
                  </tr>
                  {expandedDriverId === d.id && (() => {
                    const profile = getProfile(d)
                    return (
                      <tr className="bg-slate-950/60 text-xs">
                        <td colSpan={6} className="py-4 px-6 border-b border-slate-800">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635]">Background & Licence</h4>
                              <p><span className="font-bold text-white">Experience:</span> {profile ? profile.experience : 'N/A'}</p>
                              <p><span className="font-bold text-white">Licence Validity:</span> {profile ? profile.license_status : 'N/A'}</p>
                              <p><span className="font-bold text-white">Documents:</span> {profile && profile.documents_available.length > 0 ? profile.documents_available.join(', ') : 'None selected'}</p>
                            </div>
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635]">Availability & Preference</h4>
                              <p><span className="font-bold text-white">Kaam schedule:</span> {profile ? profile.availability : 'N/A'}</p>
                              <p><span className="font-bold text-white">Service Preference:</span> {profile && profile.service_preference.length > 0 ? profile.service_preference.join(', ') : 'None selected'}</p>
                              <p><span className="font-bold text-white">Vehicles:</span> {profile && profile.vehicle_specialties.length > 0 ? profile.vehicle_specialties.join(', ') : 'None selected'}</p>
                            </div>
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635]">Additional Details</h4>
                              <p><span className="font-bold text-white">Pehle platform pe:</span> {profile ? (profile.previous_platforms || 'Nahi') : 'N/A'}</p>
                              <p className="whitespace-pre-wrap"><span className="font-bold text-white">Comments:</span> {profile ? (profile.additional_comments || 'Nahi') : 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })()}
                  </React.Fragment>
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
                      {(d.full_name || '').split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() || ''}
                    </div>
                    <div>
                      <p className="font-extrabold text-white flex items-center gap-1 text-xs">
                        {d.full_name}
                        {d.verified && <ShieldCheck size={14} className="text-emerald-400" />}
                      </p>
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

                {expandedDriverId === d.id && (() => {
                  const profile = getProfile(d)
                  return (
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-350 space-y-3 mt-2">
                      <div className="space-y-1">
                        <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-[#A3E635]">Background & Licence</h4>
                        <p><span className="font-bold text-slate-200">Experience:</span> {profile ? profile.experience : 'N/A'}</p>
                        <p><span className="font-bold text-slate-200">Licence Validity:</span> {profile ? profile.license_status : 'N/A'}</p>
                        <p><span className="font-bold text-slate-200">Documents:</span> {profile && profile.documents_available.length > 0 ? profile.documents_available.join(', ') : 'None'}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-[#A3E635]">Availability & Preference</h4>
                        <p><span className="font-bold text-slate-200">Schedule:</span> {profile ? profile.availability : 'N/A'}</p>
                        <p><span className="font-bold text-slate-200">Services:</span> {profile && profile.service_preference.length > 0 ? profile.service_preference.join(', ') : 'None'}</p>
                        <p><span className="font-bold text-slate-200">Vehicles:</span> {profile && profile.vehicle_specialties.length > 0 ? profile.vehicle_specialties.join(', ') : 'None'}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-[#A3E635]">Additional Details</h4>
                        <p><span className="font-bold text-slate-200">Pehle Platform:</span> {profile ? (profile.previous_platforms || 'Nahi') : 'N/A'}</p>
                        <p className="whitespace-pre-wrap"><span className="font-bold text-slate-200">Comments:</span> {profile ? (profile.additional_comments || 'Nahi') : 'N/A'}</p>
                      </div>
                    </div>
                  )
                })()}

                <div className="pt-2.5 border-t border-slate-850 flex justify-end gap-2">
                  {d.verified ? (
                    <button
                      onClick={() => toggleVerification(d.id, d.verified)}
                      disabled={updatingId === d.id}
                      className="bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-500 hover:text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                    >
                      Suspend Account
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleVerification(d.id, d.verified)}
                        disabled={updatingId === d.id}
                        className="bg-emerald-500 text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer shadow-md"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectDriver(d.id)}
                        disabled={updatingId === d.id}
                        className="bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-500 hover:text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openResetModal(d.id, d.full_name)}
                    className="bg-slate-800 border border-slate-700 text-slate-200 hover:text-white py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer flex items-center gap-1"
                  >
                    <Key size={10} /> Reset Password
                  </button>
                  <button
                    onClick={() => setExpandedDriverId(expandedDriverId === d.id ? null : d.id)}
                    className="bg-slate-800 border border-slate-700 text-slate-200 hover:text-white py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                  >
                    {expandedDriverId === d.id ? 'Hide details' : 'View details'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-2">Reset Password</h3>
            <p className="text-xs text-slate-350 mb-4">
              Enter a new password for <span className="font-extrabold text-amber-400">{targetDriverName}</span>. 
              The driver will receive a security notification and must use the new password to log in next time.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  disabled={resettingPassword}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 shadow-md shadow-amber-500/5"
                >
                  {resettingPassword ? (
                    <>
                      <div className="h-3 w-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
