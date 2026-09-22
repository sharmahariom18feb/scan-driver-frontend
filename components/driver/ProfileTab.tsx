'use client'

import React, { useState, useEffect } from 'react'
import { ShieldCheck, AlertTriangle, LogOut, Copy, X, Camera } from 'lucide-react'
import { DriverInfo } from '@/redux/slices/driverSlice'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'

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
  const [photoUrl, setPhotoUrl] = useState<string | null>(info?.photoUrl || null)
  const [imgError, setImgError] = useState(false)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)

  useEffect(() => {
    if (info?.photoUrl) {
      setPhotoUrl(info.photoUrl)
      setImgError(false)
      return
    }

    const fetchPhoto = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const driverId = info?.id || session?.user?.id
        if (!driverId) return

        const { data, error } = await supabase
          .from('driver_documents')
          .select('selfie_url')
          .eq('driver_id', driverId)
          .maybeSingle()

        if (!error && data?.selfie_url) {
          setPhotoUrl(data.selfie_url)
          setImgError(false)
        }
      } catch (err) {
        console.warn('Error fetching driver photo in ProfileTab:', err)
      }
    }

    fetchPhoto()
  }, [info?.id, info?.photoUrl])

  const hasValidPhoto = Boolean(photoUrl && !imgError)

  return (
    <div className="px-5 py-6 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-foreground font-sans">
        My Profile
      </h2>

      {/* Profile Welcome Box */}
      <div className="bg-card border border-border/10 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl" />

        {/* Driver Photo Avatar */}
        <div className="relative shrink-0">
          <div
            onClick={() => hasValidPhoto && setIsPhotoModalOpen(true)}
            className={`h-20 w-20 rounded-full overflow-hidden flex items-center justify-center shadow-lg border-2 border-gold/50 transition-all ${
              hasValidPhoto
                ? 'cursor-pointer hover:border-gold hover:scale-105 active:scale-95 ring-2 ring-primary/20'
                : 'bg-gradient-to-tr from-gold to-yellow-500 text-black font-bold text-2xl'
            }`}
            title={hasValidPhoto ? 'Click to view full photo' : undefined}
          >
            {hasValidPhoto ? (
              <img
                src={photoUrl!}
                alt={info?.fullName || 'Driver'}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              info?.avatar || 'RK'
            )}
          </div>

          {/* Online status indicator dot */}
          <span
            className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-card ${
              info?.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
            title={info?.isOnline ? 'Online' : 'Offline'}
          />
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

      {/* Driver Photo Preview Modal */}
      {isPhotoModalOpen && photoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in-50 duration-200">
          <div className="bg-card border border-border/20 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl relative flex flex-col items-center p-6 space-y-4">
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute top-3 right-3 text-text-muted hover:text-foreground p-1.5 rounded-full hover:bg-surface2 transition-colors cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>

            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gold shadow-xl ring-4 ring-primary/20 shrink-0 mt-2">
              <img
                src={photoUrl}
                alt={info?.fullName || 'Driver Photo'}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-foreground">{info?.fullName}</h3>
              <p className="text-xs text-text-muted">
                {info?.uniqueId ? `Driver ID: ${info.uniqueId}` : 'Registered Driver'}
              </p>
              {info?.verified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-1">
                  <ShieldCheck size={12} /> Verified Driver
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(false)}
              className="w-full py-2 bg-surface2 hover:bg-surface border border-border/20 text-foreground font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
