'use client'

import React from 'react'
import { ShieldCheck, AlertTriangle, LogOut, Copy } from 'lucide-react'
import { DriverInfo } from '@/redux/slices/driverSlice'
import { toast } from 'sonner'

interface ProfileTabProps {
  info: DriverInfo | null
  editFullName: string
  setEditFullName: (val: string) => void
  editPhone: string
  setEditPhone: (val: string) => void

  editCurrentArea: string
  setEditCurrentArea: (val: string) => void
  editLicenseNo: string
  setEditLicenseNo: (val: string) => void
  handleUpdateProfile: (e: React.FormEvent) => Promise<void>
  handleLogout: () => void
}

export default function ProfileTab({
  info,
  editFullName,
  setEditFullName,
  editPhone,
  setEditPhone,

  editCurrentArea,
  setEditCurrentArea,
  editLicenseNo,
  setEditLicenseNo,
  handleUpdateProfile,
  handleLogout,
}: ProfileTabProps) {
  return (
    <div className="px-5 py-6 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-foreground font-sans">
        My Profile
      </h2>

      {/* Profile Welcome Box */}
      <div className="bg-card border border-border/10 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl" />

        <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-gold to-yellow-500 text-black font-bold text-2xl flex items-center justify-center shadow-lg border border-gold/20 shrink-0">
          {info?.avatar || 'RK'}
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-lg text-foreground leading-none">
            {info?.fullName}
          </h3>

          <div className="flex flex-col gap-1.5 pt-1">
            {info?.verified ? (
              <>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-500 uppercase tracking-wider self-start">
                  <ShieldCheck size={10} /> Verified Driver
                </span>
                {info.referralCode && (
                  <div className="flex items-center gap-1.5 bg-surface2/60 border border-border/10 rounded-lg py-1 px-2.5 text-[11px] text-text-muted mt-1.5 shadow-xs self-start">
                    <span className="font-semibold">Ref:</span>
                    <span className="font-mono font-bold text-gold-light">{info.referralCode}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (info.referralCode) {
                          navigator.clipboard.writeText(info.referralCode)
                          toast.success('Referral code copied to clipboard!')
                        }
                      }}
                      className="p-1 rounded hover:bg-surface cursor-pointer transition-colors text-gold hover:text-gold-light flex items-center justify-center border border-border/5"
                      title="Copy Code"
                    >
                      <Copy size={11} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] font-bold text-rose-500 uppercase tracking-wider self-start">
                <AlertTriangle size={10} /> Pending Verification
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile fields form */}
      <form onSubmit={handleUpdateProfile} className="space-y-5">
        <div className="space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-text-muted border-b border-border/10 pb-2">
            Personal Information
          </h3>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              className="w-full px-3 py-2 text-base bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              required
              value={editPhone}
              disabled
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-3 py-2 text-base bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors cursor-not-allowed bg-slate-100"
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
              className="w-full px-3 py-2 text-base bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
            />
          </div>
        </div>

        {/* <div className="space-y-4 pt-2">
          <h3 className="font-bold text-sm uppercase tracking-wider text-text-muted border-b border-border/10 pb-2">
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
              className="w-full px-3 py-2 text-base bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
            />
          </div>
        </div> */}

        <div className="pt-4 flex flex-col gap-3">
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-primary text-black font-semibold text-base rounded-md shadow-md hover:bg-gold-light transition-colors duration-300 flex items-center justify-center cursor-pointer"
          >
            Save Profile Changes
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-surface2 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 border border-border/20 hover:border-rose-500/20 font-semibold text-base rounded-md shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </form>
    </div>
  )
}
