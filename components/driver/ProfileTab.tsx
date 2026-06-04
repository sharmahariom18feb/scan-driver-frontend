'use client'

import React from 'react'
import { ShieldCheck, AlertTriangle, LogOut } from 'lucide-react'
import { DriverInfo } from '@/redux/slices/driverSlice'

interface ProfileTabProps {
  info: DriverInfo | null
  editFirstName: string
  setEditFirstName: (val: string) => void
  editLastName: string
  setEditLastName: (val: string) => void
  editPhone: string
  setEditPhone: (val: string) => void
  editEmail: string
  setEditEmail: (val: string) => void
  editCurrentArea: string
  setEditCurrentArea: (val: string) => void
  editLicenseNo: string
  setEditLicenseNo: (val: string) => void
  handleUpdateProfile: (e: React.FormEvent) => Promise<void>
  handleLogout: () => void
}

export default function ProfileTab({
  info,
  editFirstName,
  setEditFirstName,
  editLastName,
  setEditLastName,
  editPhone,
  setEditPhone,
  editEmail,
  setEditEmail,
  editCurrentArea,
  setEditCurrentArea,
  editLicenseNo,
  setEditLicenseNo,
  handleUpdateProfile,
  handleLogout,
}: ProfileTabProps) {
  return (
    <div className="px-5 py-6 space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
        My Profile
      </h2>

      {/* Profile Welcome Box */}
      <div className="bg-card border border-border/10 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl" />

        <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-gold to-yellow-500 text-black font-bold text-xl flex items-center justify-center shadow-lg border border-gold/20 shrink-0">
          {info?.avatar || 'RK'}
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-base text-foreground leading-none">
            {info?.firstName} {info?.lastName}
          </h3>
          <p className="text-xs text-text-muted">{info?.email}</p>
          <div className="flex items-center gap-1 pt-1">
            {info?.verified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                <ShieldCheck size={10} /> Verified Driver
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] font-bold text-rose-500 uppercase tracking-wider">
                <AlertTriangle size={10} /> Pending Verification
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile fields form */}
      <form onSubmit={handleUpdateProfile} className="space-y-5">
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted border-b border-border/10 pb-2">
            Personal Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              required
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
              Current Area
            </label>
            <input
              type="text"
              required
              value={editCurrentArea}
              onChange={(e) => setEditCurrentArea(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted border-b border-border/10 pb-2">
            License & Vehicle Info
          </h3>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
              Driving License No.
            </label>
            <input
              type="text"
              required
              value={editLicenseNo}
              onChange={(e) => setEditLicenseNo(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-primary text-black font-semibold text-sm rounded-md shadow-md hover:bg-gold-light transition-colors duration-300 flex items-center justify-center cursor-pointer"
          >
            Save Profile Changes
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-surface2 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 border border-border/20 hover:border-rose-500/20 font-semibold text-sm rounded-md shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </form>
    </div>
  )
}
